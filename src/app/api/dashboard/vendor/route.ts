import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Vendor } from "@/models/vendor"
import { Order } from "@/models/order"
import { Product } from "@/models/product"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verify vendor access
    if (!session || session.user.role !== "vendor") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    await connectDB()

    const vendorId = session.user.id

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Parallel data fetching for performance
    const [
      vendor,
      totalProducts,
      activeProducts,
      totalOrders,
      ordersThisMonth,
      recentOrders,
      totalRevenueResult,
      monthlyRevenueResult,
      lowStockProducts,
      topSellingProducts
    ] = await Promise.all([
      // Vendor info
      Vendor.findById(vendorId),

      // Product stats
      Product.countDocuments({ vendorId }),
      Product.countDocuments({ vendorId, isActive: true }),

      // Order stats
      Order.countDocuments({ vendorId }),
      Order.countDocuments({ 
        vendorId,
        createdAt: { $gte: startOfMonth }
      }),

      // Recent orders
      Order.find({ vendorId })
        .populate("customerId", "firstName lastName email")
        .populate("items.productId", "name")
        .sort({ createdAt: -1 })
        .limit(10),

      // Revenue stats
      Order.aggregate([
        { 
          $match: { 
            vendorId: vendorId,
            orderStatus: { $in: ["delivered", "completed"] },
            createdAt: { $gte: startOfYear }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            vendorId: vendorId,
            orderStatus: { $in: ["delivered", "completed"] },
            createdAt: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),

      // Low stock products
      Product.find({ 
        vendorId,
        isActive: true,
        "inventory.stockQuantity": { $lt: 10 }
      }).limit(10),

      // Top selling products
      Order.aggregate([
        { $match: { vendorId: vendorId } },
        { $unwind: "$items" },
        { $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }},
        { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }},
        { $unwind: "$product" },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ])
    ])

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      )
    }

    const totalRevenue = totalRevenueResult[0]?.total || 0
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order: {
      _id: string;
      orderNumber: string;
      customerId?: { firstName: string; lastName: string };
      items: { length: number };
      totalAmount: number;
      orderStatus: string;
      createdAt: Date;
    }) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customerId ? `${order.customerId.firstName} ${order.customerId.lastName}` : "Unknown",
      items: order.items.length,
      amount: order.totalAmount,
      status: order.orderStatus,
      createdAt: order.createdAt
    }))

    // Format low stock products
    const formattedLowStock = lowStockProducts.map((product: {
      _id: string;
      name: string;
      inventory?: { stockQuantity?: number; minStockLevel?: number };
      sku: string;
    }) => ({
      id: product._id,
      name: product.name,
      currentStock: product.inventory?.stockQuantity || 0,
      minStock: product.inventory?.minStockLevel || 5,
      sku: product.sku
    }))

    // Format top selling products
    const formattedTopSelling = topSellingProducts.map((item: {
      product: {
        _id: string;
        name: string;
        pricing?: { sellingPrice?: number; basePrice?: number };
      };
      totalSold: number;
      totalRevenue: number;
    }) => ({
      id: item.product._id,
      name: item.product.name,
      totalSold: item.totalSold,
      revenue: item.totalRevenue,
      price: item.product.pricing?.sellingPrice || item.product.pricing?.basePrice || 0
    }))

    const dashboardData = {
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        ordersThisMonth,
        totalRevenue,
        monthlyRevenue,
        averageRating: vendor.performanceMetrics?.averageRating || 0,
        totalReviews: vendor.performanceMetrics?.totalReviews || 0
      },
      recentOrders: formattedRecentOrders,
      lowStockProducts: formattedLowStock,
      topSellingProducts: formattedTopSelling,
      vendor: {
        name: vendor.businessInfo?.businessName || `${vendor.firstName} ${vendor.lastName}`,
        email: vendor.email,
        accountStatus: vendor.accountStatus,
        verificationStatus: vendor.verificationStatus,
        memberSince: vendor.createdAt
      },
      performanceMetrics: vendor.performanceMetrics || {
        totalSales: 0,
        totalOrders: 0,
        averageRating: 0,
        totalReviews: 0,
        responseTime: 0,
        returnRate: 0,
        cancellationRate: 0,
        onTimeDeliveryRate: 0
      }
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error("Vendor dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}

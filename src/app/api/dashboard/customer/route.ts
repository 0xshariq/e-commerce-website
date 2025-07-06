import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Order } from "@/models/order"
import { Wishlist } from "@/models/wishlist"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verify customer access
    if (!session || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    await connectDB()

    const customerId = session.user.id

    // Get current date ranges
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Parallel data fetching for performance
    const [
      customer,
      totalOrders,
      recentOrders,
      wishlistItems,
      totalSpentResult,
      savedAddresses,
      recommendations
    ] = await Promise.all([
      // Customer info
      Customer.findById(customerId),

      // Order stats
      Order.countDocuments({ customerId }),

      // Recent orders
      Order.find({ customerId })
        .populate("vendorId", "businessInfo.businessName firstName lastName")
        .populate("items.productId", "name images")
        .sort({ createdAt: -1 })
        .limit(10),

      // Wishlist
      Wishlist.findOne({ customerId })
        .populate("items.productId", "name pricing images")
        .lean(),

      // Total spent this year
      Order.aggregate([
        { 
          $match: { 
            customerId: customerId,
            orderStatus: { $in: ["delivered", "completed"] },
            createdAt: { $gte: startOfYear }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),

      // Saved addresses count
      Customer.findById(customerId, "addresses").lean(),

      // Product recommendations based on order history
      Order.aggregate([
        { $match: { customerId: customerId } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId" } },
        { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }},
        { $unwind: "$product" },
        { $lookup: {
          from: "products",
          localField: "product.category",
          foreignField: "category",
          as: "relatedProducts"
        }},
        { $unwind: "$relatedProducts" },
        { $match: { "relatedProducts._id": { $ne: "$_id" } } },
        { $group: { _id: "$relatedProducts._id", product: { $first: "$relatedProducts" } } },
        { $limit: 6 }
      ])
    ])

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    const totalSpent = totalSpentResult[0]?.total || 0
    const wishlistCount = wishlistItems?.items?.length || 0

    // Format recent orders
    interface PopulatedOrder {
      _id: string;
      orderNumber: string;
      items: Array<{
        productId?: {
          name?: string;
        };
        quantity: number;
      }>;
      totalAmount: number;
      orderStatus: string;
      createdAt: Date;
      vendorId?: {
        businessInfo?: {
          businessName?: string;
        };
        firstName?: string;
        lastName?: string;
      };
    }

    const formattedRecentOrders = recentOrders.map((order: PopulatedOrder) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      productName: order.items[0]?.productId?.name || "Multiple items",
      quantity: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
      amount: order.totalAmount,
      status: order.orderStatus,
      createdAt: order.createdAt,
      vendor: order.vendorId?.businessInfo?.businessName || 
               (order.vendorId ? `${order.vendorId.firstName} ${order.vendorId.lastName}` : "Unknown")
    }))

    // Format recommendations
    interface RecommendationItem {
      product: {
        _id: string;
        name: string;
        pricing?: {
          sellingPrice?: number;
          basePrice?: number;
        };
        rating?: {
          average?: number;
          count?: number;
        };
        images?: string[];
        vendor?: {
          businessInfo?: {
            businessName?: string;
          };
        };
      };
    }

    const formattedRecommendations = recommendations.map((item: RecommendationItem) => {
      const product = item.product
      return {
        id: product._id,
        name: product.name,
        price: product.pricing?.sellingPrice || product.pricing?.basePrice || 0,
        originalPrice: product.pricing?.basePrice || 0,
        rating: product.rating?.average || 0,
        reviews: product.rating?.count || 0,
        image: product.images?.[0] || "/placeholder-product.jpg"
      }
    })

    const dashboardData = {
      stats: {
        totalOrders,
        wishlistCount,
        totalSpent,
        savedAddresses: savedAddresses?.addresses?.length || 0
      },
      recentOrders: formattedRecentOrders,
      recommendations: formattedRecommendations,
      customer: {
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        memberSince: customer.createdAt,
        loyaltyPoints: customer.loyaltyPoints || 0
      }
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error("Customer dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}

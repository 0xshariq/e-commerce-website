import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Product } from "@/models/product"
import { Order } from "@/models/order"
import { Payment } from "@/models/payment"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verify admin access
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    await connectDB()

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallel data fetching for performance
    const [
      totalCustomers,
      newCustomersThisMonth,
      totalVendors,
      pendingVendors,
      totalProducts,
      flaggedProducts,
      totalOrders,
      ordersThisMonth,
      totalRevenue,
      revenueThisMonth,
      recentOrders,
      recentActivities,
      pendingApprovals
    ] = await Promise.all([
      // Customer stats
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ 
        isActive: true,
        createdAt: { $gte: startOfMonth }
      }),

      // Vendor stats
      Vendor.countDocuments({ accountStatus: "active" }),
      Vendor.countDocuments({ 
        accountStatus: "under_review",
        isApproved: false
      }),

      // Product stats
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ 
        isActive: true,
        adminApprovalStatus: "flagged"
      }),

      // Order stats
      Order.countDocuments(),
      Order.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),

      // Revenue stats
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: "completed",
            createdAt: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      // Recent orders
      Order.find()
        .populate("customerId", "firstName lastName email")
        .populate("vendorId", "businessInfo.businessName")
        .sort({ createdAt: -1 })
        .limit(10),

      // Recent activities (from orders and registrations)
      Promise.all([
        Order.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
          .populate("customerId", "firstName lastName")
          .sort({ createdAt: -1 })
          .limit(5),
        Vendor.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
          .sort({ createdAt: -1 })
          .limit(5),
        Customer.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
          .select("firstName lastName email createdAt")
          .sort({ createdAt: -1 })
          .limit(5)
      ]),

      // Pending approvals
      Promise.all([
        Vendor.find({ accountStatus: "under_review", isApproved: false })
          .select("firstName lastName email businessInfo createdAt")
          .limit(20),
        Product.find({ adminApprovalStatus: "pending" })
          .select("name category pricing createdAt")
          .populate("vendorId", "businessInfo.businessName")
          .limit(20)
      ])
    ])

    // Calculate growth percentages
    const customerGrowth = newCustomersThisMonth || 0
    const totalRevenueAmount = totalRevenue[0]?.total || 0
    const monthlyRevenueAmount = revenueThisMonth[0]?.total || 0

    // Format recent activities
    const [recentOrdersActivity, recentVendors, recentCustomers] = recentActivities
    const activities = [
      ...recentOrdersActivity.map((order: {
        _id: string;
        orderNumber: string;
        customerId?: { firstName: string; lastName: string };
        totalAmount: number;
        createdAt: Date;
      }) => ({
        id: order._id,
        type: "order",
        action: "New order placed",
        user: order.customerId ? `${order.customerId.firstName} ${order.customerId.lastName}` : "Unknown Customer",
        details: `Order #${order.orderNumber} - ₹${order.totalAmount}`,
        timestamp: order.createdAt
      })),
      ...recentVendors.map((vendor: {
        _id: string;
        firstName: string;
        lastName: string;
        businessInfo?: { businessName?: string };
        createdAt: Date;
      }) => ({
        id: vendor._id,
        type: "vendor_registration",
        action: "New vendor registration",
        user: vendor.businessInfo?.businessName || `${vendor.firstName} ${vendor.lastName}`,
        details: "Awaiting approval",
        timestamp: vendor.createdAt
      })),
      ...recentCustomers.map((customer: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: Date;
      }) => ({
        id: customer._id,
        type: "customer_registration",
        action: "New customer registration",
        user: `${customer.firstName} ${customer.lastName}`,
        details: customer.email,
        timestamp: customer.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    // Format pending approvals
    const [pendingVendorsList, pendingProductsList] = pendingApprovals

    const dashboardData = {
      stats: {
        totalRevenue: totalRevenueAmount,
        monthlyRevenue: monthlyRevenueAmount,
        totalCustomers,
        newCustomers: customerGrowth,
        totalVendors,
        pendingVendors,
        totalProducts,
        flaggedProducts,
        totalOrders,
        ordersThisMonth
      },
      recentOrders: recentOrders.map((order: {
        _id: string;
        orderNumber: string;
        customerId?: { firstName: string; lastName: string };
        vendorId?: { businessInfo?: { businessName?: string } };
        totalAmount: number;
        orderStatus: string;
        createdAt: Date;
      }) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customerId ? `${order.customerId.firstName} ${order.customerId.lastName}` : "Unknown",
        vendor: order.vendorId?.businessInfo?.businessName || "Unknown Vendor",
        amount: order.totalAmount,
        status: order.orderStatus,
        createdAt: order.createdAt
      })),
      recentActivities: activities,
      pendingApprovals: {
        vendors: pendingVendorsList.map((vendor: {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
          businessInfo?: { businessName?: string; businessType?: string };
          createdAt: Date;
        }) => ({
          id: vendor._id,
          name: vendor.businessInfo?.businessName || `${vendor.firstName} ${vendor.lastName}`,
          email: vendor.email,
          businessType: vendor.businessInfo?.businessType,
          createdAt: vendor.createdAt
        })),
        products: pendingProductsList.map((product: {
          _id: string;
          name: string;
          category: string;
          vendorId?: { businessInfo?: { businessName?: string } };
          pricing?: { 
            sellingPrice?: number;
            basePrice?: number;
          };
          createdAt: Date;
        }) => ({
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.pricing?.sellingPrice || product.pricing?.basePrice,
          vendor: product.vendorId,
          createdAt: product.createdAt
        }))
      },
      systemHealth: {
        apiStatus: "online",
        databaseStatus: "healthy",
        storageUsage: 85,
        cdnStatus: "active"
      }
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error("Admin dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}

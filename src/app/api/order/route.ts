import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Order } from "@/models/order"
import { Cart } from "@/models/cart"
import { Product } from "@/models/product"
import { Customer } from "@/models/customer"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    await connectDB()

    const query: any = {}

    // Role-based filtering
    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    }
    // Admin can see all orders

    if (status) {
      query.orderStatus = status
    }

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email phone")
        .populate("vendorId", "businessName email phone")
        .populate("productId", "productName imageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cartItems, shippingAddress, paymentMethod, paymentId, couponCode, specialInstructions } =
      await request.json()

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 })
    }

    await connectDB()

    // Verify customer exists
    const customer = await Customer.findOne({ email: session.user.email })
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Verify cart items and create orders
    const orderPromises = cartItems.map(async (item: any) => {
      const product = await Product.findById(item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}`)
      }

      // Create order
      const order = new Order({
        customerId: customer._id,
        vendorId: product.vendorId,
        productId: product._id,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: item.quantity,
        totalAmount: product.productPrice * item.quantity,
        shippingAddress,
        paymentMethod,
        paymentId,
        orderStatus: "pending",
        paymentStatus: paymentId ? "paid" : "pending",
        specialInstructions: specialInstructions || "",
      })

      await order.save()

      // Update product stock
      product.stockQuantity -= item.quantity
      await product.save()

      // Remove from cart
      await Cart.findOneAndDelete({
        customerId: customer._id,
        productId: product._id,
      })

      return order
    })

    const orders = await Promise.all(orderPromises)

    return NextResponse.json(
      {
        message: "Orders created successfully",
        orders,
        orderCount: orders.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating orders:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderIds, updateData } = await request.json()

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: "Order IDs are required" }, { status: 400 })
    }

    await connectDB()

    const query =
      session.user.role === "vendor"
        ? { _id: { $in: orderIds }, vendorId: session.user.id }
        : { _id: { $in: orderIds } }

    const result = await Order.updateMany(query, { ...updateData, updatedAt: new Date() }, { runValidators: true })

    return NextResponse.json({
      message: `${result.modifiedCount} orders updated successfully`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error bulk updating orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const orderIds = searchParams.get("ids")?.split(",") || []

    if (orderIds.length === 0) {
      return NextResponse.json({ error: "Order IDs are required" }, { status: 400 })
    }

    await connectDB()

    // Only allow deletion of cancelled orders
    const result = await Order.deleteMany({
      _id: { $in: orderIds },
      orderStatus: "cancelled",
    })

    return NextResponse.json({
      message: `${result.deletedCount} orders deleted successfully`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, action, data } = await request.json()

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 })
    }

    await connectDB()

    const query: any = { _id: orderId }

    // Role-based access control
    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    }

    const order = await Order.findOne(query)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    switch (action) {
      case "cancel":
        if (session.user.role !== "customer" || order.orderStatus !== "pending") {
          return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 })
        }
        order.orderStatus = "cancelled"
        order.cancelledAt = new Date()
        order.cancellationReason = data?.reason || "Cancelled by customer"
        break

      case "update_status":
        if (session.user.role !== "vendor" && session.user.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized to update status" }, { status: 403 })
        }
        order.orderStatus = data.status
        if (data.status === "shipped") {
          order.shippedAt = new Date()
          order.trackingNumber = data.trackingNumber
        } else if (data.status === "delivered") {
          order.deliveredAt = new Date()
        }
        break

      case "update_tracking":
        if (session.user.role !== "vendor") {
          return NextResponse.json({ error: "Only vendors can update tracking" }, { status: 403 })
        }
        order.trackingNumber = data.trackingNumber
        order.trackingUrl = data.trackingUrl
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    order.updatedAt = new Date()
    await order.save()

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error patching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
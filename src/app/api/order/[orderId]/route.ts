import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Order } from "@/models/order"
import { Shipment } from "@/models/shipment"
import { Payment } from "@/models/payment"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const query: any = { _id: params.orderId }

    // Role-based access control
    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    }
    // Admin can access all orders

    const order = await Order.findOne(query)
      .populate("vendorId", "businessName shopAddress email phone")
      .populate("productId", "productName imageUrl description")
      .populate("customerId", "name email phone")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get related data
    const [shipment, payment] = await Promise.all([
      Shipment.findOne({ orderId: params.orderId }),
      Payment.findOne({ orderId: params.orderId }),
    ])

    return NextResponse.json({
      order,
      shipment,
      payment,
      timeline: [
        { status: "pending", date: order.createdAt, completed: true },
        { status: "confirmed", date: order.confirmedAt, completed: !!order.confirmedAt },
        { status: "shipped", date: order.shippedAt, completed: !!order.shippedAt },
        { status: "delivered", date: order.deliveredAt, completed: !!order.deliveredAt },
      ],
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    const query =
      session.user.role === "vendor" ? { _id: params.orderId, vendorId: session.user.id } : { _id: params.orderId }

    const order = await Order.findOneAndUpdate(
      query,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate([
      { path: "vendorId", select: "businessName email" },
      { path: "productId", select: "productName imageUrl" },
      { path: "customerId", select: "name email" },
    ])

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const order = await Order.findById(params.orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.orderStatus !== "cancelled") {
      return NextResponse.json({ error: "Only cancelled orders can be deleted" }, { status: 400 })
    }

    await Order.findByIdAndDelete(params.orderId)

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { field, value, action } = await request.json()

    await connectDB()

    const query: any = { _id: params.orderId }

    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    }

    const order = await Order.findOne(query)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (action) {
      switch (action) {
        case "confirm":
          if (session.user.role !== "vendor") {
            return NextResponse.json({ error: "Only vendors can confirm orders" }, { status: 403 })
          }
          order.orderStatus = "confirmed"
          order.confirmedAt = new Date()
          break

        case "ship":
          if (session.user.role !== "vendor") {
            return NextResponse.json({ error: "Only vendors can ship orders" }, { status: 403 })
          }
          order.orderStatus = "shipped"
          order.shippedAt = new Date()
          if (value?.trackingNumber) {
            order.trackingNumber = value.trackingNumber
          }
          break

        case "deliver":
          if (session.user.role !== "vendor" && session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized to mark as delivered" }, { status: 403 })
          }
          order.orderStatus = "delivered"
          order.deliveredAt = new Date()
          break

        case "cancel":
          if (session.user.role === "customer" && order.orderStatus === "pending") {
            order.orderStatus = "cancelled"
            order.cancelledAt = new Date()
            order.cancellationReason = value?.reason || "Cancelled by customer"
          } else if (session.user.role === "vendor" || session.user.role === "admin") {
            order.orderStatus = "cancelled"
            order.cancelledAt = new Date()
            order.cancellationReason = value?.reason || "Cancelled by vendor"
          } else {
            return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 })
          }
          break

        default:
          return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }
    } else if (field) {
      order[field] = value
    }

    order.updatedAt = new Date()
    await order.save()

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error patching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    await connectDB()

    const query: any = { _id: params.orderId }

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
      case "reorder":
        if (session.user.role !== "customer") {
          return NextResponse.json({ error: "Only customers can reorder" }, { status: 403 })
        }

        const newOrder = new Order({
          customerId: order.customerId,
          vendorId: order.vendorId,
          productId: order.productId,
          productName: order.productName,
          productPrice: order.productPrice,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          orderStatus: "pending",
          paymentStatus: "pending",
        })

        await newOrder.save()
        await newOrder.populate([
          { path: "vendorId", select: "businessName" },
          { path: "productId", select: "productName imageUrl" },
        ])

        return NextResponse.json({ order: newOrder })

      case "duplicate":
        if (session.user.role !== "vendor" && session.user.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const duplicatedOrder = new Order({
          ...order.toObject(),
          _id: undefined,
          orderStatus: "pending",
          paymentStatus: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await duplicatedOrder.save()
        return NextResponse.json({ order: duplicatedOrder })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in order action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

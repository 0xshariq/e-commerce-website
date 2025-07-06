import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Order } from "@/models/order"
import { Product } from "@/models/product"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") // pending, confirmed, processing, shipped, delivered, cancelled
    const paymentStatus = searchParams.get("paymentStatus") // pending, paid, failed, refunded
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const search = searchParams.get("search")

    // Build query
    let query: any = {}
    
    if (status) {
      query.status = status
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } }
      ]
    }

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }

    // Role-based access control
    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    }
    // Admin can see all orders

    const skip = (page - 1) * limit

    const orders = await Order.find(query)
      .populate("customerId", "name email phone")
      .populate("vendorId", "businessName email")
      .populate("items.productId", "name price images")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Order.countDocuments(query)

    // Calculate summary stats
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      }
    ])

    return NextResponse.json({
      orders,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
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
      return NextResponse.json({ error: "Customer access required" }, { status: 401 })
    }

    await connectDB()

    const {
      items,
      shippingAddress,
      billingAddress,
      couponCode,
      specialInstructions
    } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 })
    }

    // Validate products and calculate amounts
    let subtotal = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || product.status !== "active") {
        return NextResponse.json({ 
          error: `Product ${item.productId} not found or inactive` 
        }, { status: 400 })
      }

      if (item.quantity > product.stock) {
        return NextResponse.json({ 
          error: `Insufficient stock for product ${product.name}` 
        }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      validatedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      })
    }

    // Apply coupon if provided
    let discount = 0
    if (couponCode) {
      // Implement coupon validation logic here
      // For now, we'll skip this
    }

    const tax = subtotal * 0.18 // 18% GST
    const shippingFee = subtotal > 500 ? 0 : 50 // Free shipping above ₹500
    const totalAmount = subtotal + tax + shippingFee - discount

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Group items by vendor (assuming single vendor for now)
    const vendorId = await Product.findById(validatedItems[0].productId).select("vendorId")

    const order = new Order({
      orderNumber,
      customerId: session.user.id,
      vendorId: vendorId?.vendorId,
      items: validatedItems,
      subtotal,
      tax,
      shippingFee,
      discount,
      totalAmount,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      couponCode,
      specialInstructions,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await order.save()

    // Reduce product stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order created successfully",
      order: order.toObject()
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { orderId, action, data } = await request.json()

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "customer" && order.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (session.user.role === "vendor" && order.vendorId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    let result

    switch (action) {
      case "confirm":
        if (session.user.role !== "vendor" && session.user.role !== "admin") {
          return NextResponse.json({ error: "Vendor or admin access required" }, { status: 403 })
        }
        result = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "confirmed",
            confirmedAt: new Date(),
            confirmedBy: session.user.id,
            updatedAt: new Date()
          },
          { new: true }
        )
        break
      
      case "process":
        if (session.user.role !== "vendor" && session.user.role !== "admin") {
          return NextResponse.json({ error: "Vendor or admin access required" }, { status: 403 })
        }
        result = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "processing",
            processingAt: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )
        break
      
      case "ship":
        if (session.user.role !== "vendor" && session.user.role !== "admin") {
          return NextResponse.json({ error: "Vendor or admin access required" }, { status: 403 })
        }
        result = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "shipped",
            shippedAt: new Date(),
            trackingNumber: data?.trackingNumber,
            carrier: data?.carrier,
            updatedAt: new Date()
          },
          { new: true }
        )
        break
      
      case "deliver":
        if (session.user.role !== "vendor" && session.user.role !== "admin") {
          return NextResponse.json({ error: "Vendor or admin access required" }, { status: 403 })
        }
        result = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "delivered",
            deliveredAt: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )
        break
      
      case "cancel":
        if (order.status === "shipped" || order.status === "delivered") {
          return NextResponse.json({ error: "Cannot cancel shipped or delivered orders" }, { status: 400 })
        }

        result = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: session.user.id,
            cancellationReason: data?.reason || "Not specified",
            updatedAt: new Date()
          },
          { new: true }
        )

        // Restore product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
          )
        }
        break
      
      case "update-address":
        if (session.user.role !== "customer") {
          return NextResponse.json({ error: "Customer access required" }, { status: 403 })
        }
        if (order.status !== "pending") {
          return NextResponse.json({ error: "Can only update address for pending orders" }, { status: 400 })
        }
        result = await Order.findByIdAndUpdate(
          orderId,
          {
            shippingAddress: data.shippingAddress,
            billingAddress: data.billingAddress,
            updatedAt: new Date()
          },
          { new: true }
        )
        break
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${action}ed successfully`,
      order: result
    })

  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

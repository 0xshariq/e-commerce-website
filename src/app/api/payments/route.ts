import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Payment } from "@/models/payment"
import { Order } from "@/models/order"

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
    const status = searchParams.get("status") // pending, success, failed, refunded
    const method = searchParams.get("method") // upi, card, netbanking, wallet, paylater
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const orderId = searchParams.get("orderId")

    // Build query
    const query: any = {}
    
    if (status) {
      query.status = status
    }

    if (method) {
      query.paymentMethod = method
    }

    if (orderId) {
      query.orderId = orderId
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
      // Get vendor's orders and filter payments by those orders
      const vendorOrders = await Order.find({ vendorId: session.user.id }).select("_id")
      const orderIds = vendorOrders.map(order => order._id)
      query.orderId = { $in: orderIds }
    }
    // Admin can see all payments

    const skip = (page - 1) * limit

    const payments = await Payment.find(query)
      .populate("orderId", "orderNumber items")
      .populate("customerId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Payment.countDocuments(query)

    // Calculate summary stats
    const stats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalConvenienceFee: { $sum: "$convenienceFee" },
          totalTax: { $sum: "$tax" },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      }
    ])

    return NextResponse.json({
      payments,
      stats: stats[0] || {
        totalAmount: 0,
        totalConvenienceFee: 0,
        totalTax: 0,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching payments:", error)
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
      orderId,
      amount,
      paymentMethod,
      convenienceFee = 0,
      tax = 0,
      currency = "INR"
    } = await request.json()

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify order belongs to customer
    const order = await Order.findById(orderId)
    if (!order || order.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 })
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ orderId })
    if (existingPayment && existingPayment.status === "success") {
      return NextResponse.json({ error: "Payment already completed for this order" }, { status: 400 })
    }

    const totalAmount = amount + convenienceFee + tax

    const payment = new Payment({
      orderId,
      customerId: session.user.id,
      amount,
      convenienceFee,
      tax,
      totalAmount,
      currency,
      paymentMethod,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await payment.save()

    return NextResponse.json({ 
      success: true, 
      message: "Payment initiated successfully",
      payment: payment.toObject()
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating payment:", error)
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

    const { paymentId, action, data } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "customer" && payment.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    let result

    switch (action) {
      case "verify":
        // Verify payment with payment gateway
        if (!data?.razorpayPaymentId || !data?.razorpaySignature) {
          return NextResponse.json({ error: "Missing verification data" }, { status: 400 })
        }

        // Here you would verify with Razorpay
        // For now, we'll assume verification passes
        result = await Payment.findByIdAndUpdate(
          paymentId,
          {
            status: "success",
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            paidAt: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )

        // Update order status
        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: "paid",
          status: "confirmed"
        })
        break
      
      case "fail":
        result = await Payment.findByIdAndUpdate(
          paymentId,
          {
            status: "failed",
            failureReason: data?.reason || "Payment failed",
            failedAt: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )
        break
      
      case "refund":
        if (session.user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }

        if (payment.status !== "success") {
          return NextResponse.json({ error: "Can only refund successful payments" }, { status: 400 })
        }

        result = await Payment.findByIdAndUpdate(
          paymentId,
          {
            status: "refunded",
            refundAmount: data?.refundAmount || payment.totalAmount,
            refundReason: data?.reason || "Admin refund",
            refundedAt: new Date(),
            refundedBy: session.user.id,
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
      message: `Payment ${action}ed successfully`,
      payment: result
    })

  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

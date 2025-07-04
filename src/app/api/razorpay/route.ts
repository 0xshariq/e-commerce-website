import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Payment } from "@/models/payment"
import { Order } from "@/models/order"
import crypto from "crypto"

const Razorpay = require("razorpay")

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, amount, currency = "INR", paymentOption, cardBrand } = await request.json()

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Order ID and amount are required" }, { status: 400 })
    }

    await connectDB()

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
      _id: orderId,
      customerId: session.user.id,
    }).populate("customerId", "name email phone")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `order_${orderId}_${Date.now()}`,
      notes: {
        orderId,
        customerId: session.user.id,
        paymentOption,
        cardBrand: cardBrand || "",
      },
    })

    // Create payment record
    const payment = new Payment({
      orderId,
      customerId: session.user.id,
      amount,
      currency,
      paymentMethod: paymentOption,
      cardBrand: cardBrand || "",
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
    })

    await payment.save()

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: order.customerId.name,
        email: order.customerId.email,
        contact: order.customerId.phone || "",
      },
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentOption, cardBrand } =
      await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 })
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    await connectDB()

    // Find and update payment
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id })
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature
    payment.paymentStatus = "completed"
    payment.paymentDate = new Date()
    payment.paymentMethod = paymentOption
    payment.cardBrand = cardBrand || ""

    await payment.save()

    // Update order status
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      orderStatus: "confirmed",
    })

    return NextResponse.json({
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const orderId = searchParams.get("orderId")

    await connectDB()

    const query: any = {}

    if (paymentId) {
      query.razorpayPaymentId = paymentId
    }

    if (orderId) {
      query.orderId = orderId
    }

    // Role-based access control
    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      // Vendors can only see payments for their orders
      const vendorOrders = await Order.find({ vendorId: session.user.id }).select("_id")
      query.orderId = { $in: vendorOrders.map((o) => o._id) }
    }

    const payments = await Payment.find(query)
      .populate("orderId", "orderNumber totalAmount")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
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
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    await connectDB()

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.paymentStatus === "completed") {
      return NextResponse.json({ error: "Cannot delete completed payments" }, { status: 400 })
    }

    await Payment.findByIdAndDelete(paymentId)

    return NextResponse.json({ message: "Payment record deleted successfully" })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { paymentId, status, notes } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Payment ID and status are required" }, { status: 400 })
    }

    await connectDB()

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: status,
        adminNotes: notes || "",
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function GET_PAYMENT(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "customer" && session.user.role !== "vendor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const payment = await Payment.findOne({ _id: params.paymentId })
      .populate("orderId", "orderNumber totalAmount")
      .populate("customerId", "name email")
      .populate("vendorId", "businessName email")

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Role-based access control
    if (session.user.role === "customer" && payment.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to this payment" }, { status: 403 })
    }

    if (session.user.role === "vendor" && payment.vendorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to this payment" }, { status: 403 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

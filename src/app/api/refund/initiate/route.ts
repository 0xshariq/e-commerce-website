import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Refund, refundZodSchema } from "@/models/refund"
import { RequestRefund } from "@/models/request-refund"
import { Payment } from "@/models/payment"
import Razorpay from "razorpay"

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

    const body = await request.json()
    const { requestRefundId, razorpayPaymentId } = body

    if (!requestRefundId || !razorpayPaymentId) {
      return NextResponse.json(
        {
          error: "Request refund ID and Razorpay payment ID are required",
        },
        { status: 400 },
      )
    }

    await connectDB()

    // Verify refund request exists and is accepted
    const refundRequest = await RequestRefund.findOne({
      _id: requestRefundId,
      customerId: session.user.id,
      requestStatus: "accepted",
    }).populate("orderId vendorId")

    if (!refundRequest) {
      return NextResponse.json(
        {
          error: "Refund request not found or not approved",
        },
        { status: 404 },
      )
    }

    // Verify payment exists
    const payment = await Payment.findOne({
      razorpayPaymentId,
      customerId: session.user.id,
      paymentStatus: "completed",
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Check if refund already initiated
    const existingRefund = await Refund.findOne({ requestRefundId })
    if (existingRefund) {
      return NextResponse.json({ error: "Refund already initiated" }, { status: 400 })
    }

    const validation = refundZodSchema.safeParse({
      orderId: refundRequest.orderId._id.toString(),
      customerId: session.user.id,
      vendorId: refundRequest.vendorId._id.toString(),
      requestRefundId,
      refundAmount: refundRequest.amount,
      refundReason: refundRequest.reason,
      razorpayPaymentId,
      refundStatus: "initiated",
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid refund data",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    try {
      // Initiate refund with Razorpay
      const razorpayRefund = await razorpay.payments.refund(razorpayPaymentId, {
        amount: Math.round(refundRequest.amount * 100), // Convert to paise
        notes: {
          reason: refundRequest.reason,
          requestId: requestRefundId,
        },
      })

      // Create refund record
      const refund = new Refund({
        ...validation.data,
        razorpayRefundId: razorpayRefund.id,
        refundStatus: "processing",
        refundDate: new Date(),
      })

      await refund.save()

      await refund.populate([
        { path: "customerId", select: "name email" },
        { path: "vendorId", select: "businessName email" },
        { path: "orderId", select: "orderNumber totalAmount" },
      ])

      return NextResponse.json(
        {
          message: "Refund initiated successfully",
          refund,
          razorpayRefundId: razorpayRefund.id,
        },
        { status: 201 },
      )
    } catch (razorpayError: any) {
      console.error("Razorpay refund error:", razorpayError)

      // Create refund record with failed status
      const refund = new Refund({
        ...validation.data,
        refundStatus: "failed",
        refundNotes: `Razorpay error: ${razorpayError.error?.description || razorpayError.message}`,
        refundDate: new Date(),
      })

      await refund.save()

      return NextResponse.json(
        {
          error: "Failed to initiate refund with payment gateway",
          details: razorpayError.error?.description || razorpayError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error initiating refund:", error)
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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""

    await connectDB()

    const query: any = {}

    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    } else if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (status) {
      query.refundStatus = status
    }

    const skip = (page - 1) * limit

    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate("customerId", "name email phone")
        .populate("vendorId", "businessName email phone")
        .populate("orderId", "orderNumber totalAmount")
        .populate("requestRefundId", "reason refundReasonCategory")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Refund.countDocuments(query),
    ])

    return NextResponse.json({
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching refunds:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { refundIds, status, notes } = await request.json()

    if (!refundIds || !Array.isArray(refundIds) || !status) {
      return NextResponse.json({ error: "Refund IDs and status are required" }, { status: 400 })
    }

    await connectDB()

    const updateData: any = {
      refundStatus: status,
      processedBy: session.user.id,
      updatedAt: new Date(),
    }

    if (status === "completed") {
      updateData.completedAt = new Date()
    }

    if (notes) {
      updateData.refundNotes = notes
    }

    const result = await Refund.updateMany({ _id: { $in: refundIds } }, updateData)

    return NextResponse.json({
      message: `${result.modifiedCount} refunds updated`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating refunds:", error)
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
    const refundIds = searchParams.get("ids")?.split(",") || []

    if (refundIds.length === 0) {
      return NextResponse.json({ error: "Refund IDs are required" }, { status: 400 })
    }

    await connectDB()

    // Only allow deletion of failed refunds
    const result = await Refund.deleteMany({
      _id: { $in: refundIds },
      refundStatus: "failed",
    })

    return NextResponse.json({
      message: `${result.deletedCount} failed refunds deleted`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting refunds:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { refundId, action, data } = await request.json()

    if (!refundId || !action) {
      return NextResponse.json({ error: "Refund ID and action are required" }, { status: 400 })
    }

    await connectDB()

    const refund = await Refund.findById(refundId)
    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 })
    }

    switch (action) {
      case "complete":
        refund.refundStatus = "completed"
        refund.completedAt = new Date()
        refund.processedBy = session.user.id
        refund.refundNotes = data?.notes || "Refund completed by admin"
        break

      case "fail":
        refund.refundStatus = "failed"
        refund.processedBy = session.user.id
        refund.refundNotes = data?.reason || "Refund failed"
        break

      case "retry":
        if (refund.refundStatus !== "failed") {
          return NextResponse.json({ error: "Only failed refunds can be retried" }, { status: 400 })
        }
        refund.refundStatus = "processing"
        refund.refundNotes = "Refund retry initiated"
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    refund.updatedAt = new Date()
    await refund.save()

    return NextResponse.json({ refund })
  } catch (error) {
    console.error("Error patching refund:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

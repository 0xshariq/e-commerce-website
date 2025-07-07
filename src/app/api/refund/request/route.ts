import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { RequestRefund, RequestRefundZodSchema } from "@/models/request-refund"
import { Order } from "@/models/order"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
      _id: body.orderId,
      customerId: session.user.id,
    }).populate("vendorId", "_id")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order is eligible for refund
    if (order.orderStatus !== "delivered") {
      return NextResponse.json({ error: "Only delivered orders can be refunded" }, { status: 400 })
    }

    // Check if refund request already exists
    const existingRequest = await RequestRefund.findOne({ orderId: body.orderId })
    if (existingRequest) {
      return NextResponse.json({ error: "Refund request already exists for this order" }, { status: 400 })
    }

    const validation = RequestRefundZodSchema.safeParse({
      ...body,
      customerId: session.user.id,
      vendorId: order.vendorId._id.toString(),
      amount: body.amount || order.totalAmount,
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const refundRequest = new RequestRefund(validation.data)
    await refundRequest.save()

    await refundRequest.populate([
      { path: "customerId", select: "name email" },
      { path: "vendorId", select: "businessName email" },
      { path: "orderId", select: "orderNumber totalAmount" },
    ])

    return NextResponse.json({ refundRequest }, { status: 201 })
  } catch (error) {
    console.error("Error creating refund request:", error)
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
      query.requestStatus = status
    }

    const skip = (page - 1) * limit

    const [refundRequests, total] = await Promise.all([
      RequestRefund.find(query)
        .populate("customerId", "name email phone")
        .populate("vendorId", "businessName email phone")
        .populate("orderId", "orderNumber totalAmount createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RequestRefund.countDocuments(query),
    ])

    return NextResponse.json({
      refundRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching refund requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { requestIds, requestId, action, status, adminNotes, rejectionReason } = body

    await connectDB()

    // Handle single request (new admin approve/reject functionality)
    if (requestId && action) {
      if (!["accept", "reject"].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }

      const refundRequest = await RequestRefund.findById(requestId)
      if (!refundRequest) {
        return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
      }

      if (refundRequest.requestStatus !== "pending") {
        return NextResponse.json({ error: "Request has already been processed" }, { status: 400 })
      }

      const updateData: any = {
        requestStatus: action === "accept" ? "accepted" : "rejected",
        processedBy: session.user.id,
        processedAt: new Date(),
        adminNotes: adminNotes || "",
      }

      if (action === "reject" && rejectionReason) {
        updateData.rejectionReason = rejectionReason
      }

      const updatedRequest = await RequestRefund.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true }
      ).populate([
        { path: "customerId", select: "firstName lastName email" },
        { path: "vendorId", select: "businessName email" },
        { path: "orderId", select: "orderNumber totalAmount" },
      ])

      return NextResponse.json({ 
        message: `Refund request ${action}ed successfully`,
        refundRequest: updatedRequest 
      })
    }

    // Handle batch requests (existing functionality)
    if (!requestIds || !Array.isArray(requestIds) || !status) {
      return NextResponse.json({ error: "Request IDs and status are required" }, { status: 400 })
    }

    const query =
      session.user.role === "vendor"
        ? { _id: { $in: requestIds }, vendorId: session.user.id }
        : { _id: { $in: requestIds } }

    const updateData: any = {
      requestStatus: status,
      processedBy: session.user.id,
      processedAt: new Date(),
      updatedAt: new Date(),
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    const result = await RequestRefund.updateMany(query, updateData)

    return NextResponse.json({
      message: `${result.modifiedCount} refund requests updated`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating refund requests:", error)
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
    const requestIds = searchParams.get("ids")?.split(",") || []

    if (requestIds.length === 0) {
      return NextResponse.json({ error: "Request IDs are required" }, { status: 400 })
    }

    await connectDB()

    const result = await RequestRefund.deleteMany({
      _id: { $in: requestIds },
      requestStatus: "rejected", // Only allow deletion of rejected requests
    })

    return NextResponse.json({
      message: `${result.deletedCount} refund requests deleted`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting refund requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, data } = await request.json()

    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action are required" }, { status: 400 })
    }

    await connectDB()

    const query = session.user.role === "vendor" ? { _id: requestId, vendorId: session.user.id } : { _id: requestId }

    const refundRequest = await RequestRefund.findOne(query)
    if (!refundRequest) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
    }

    switch (action) {
      case "approve":
        refundRequest.requestStatus = "accepted"
        refundRequest.processedBy = session.user.id
        refundRequest.processedAt = new Date()
        refundRequest.adminNotes = data?.notes || ""
        break

      case "reject":
        refundRequest.requestStatus = "rejected"
        refundRequest.processedBy = session.user.id
        refundRequest.processedAt = new Date()
        refundRequest.adminNotes = data?.reason || "Request rejected"
        break

      case "update_notes":
        refundRequest.adminNotes = data?.notes || ""
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    refundRequest.updatedAt = new Date()
    await refundRequest.save()

    return NextResponse.json({ refundRequest })
  } catch (error) {
    console.error("Error patching refund request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

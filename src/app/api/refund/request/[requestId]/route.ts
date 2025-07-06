import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { RequestRefund } from "@/models/request-refund"

export async function GET(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const query: any = { _id: params.requestId }

    if (session.user.role === "customer") {
      query.customerId = session.user.id
    } else if (session.user.role === "vendor") {
      query.vendorId = session.user.id
    }

    const refundRequest = await RequestRefund.findOne(query)
      .populate("customerId", "name email phone")
      .populate("vendorId", "businessName email phone")
      .populate("orderId", "orderNumber totalAmount createdAt orderStatus")

    if (!refundRequest) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
    }

    return NextResponse.json({ refundRequest })
  } catch (error) {
    console.error("Error fetching refund request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    const query =
      session.user.role === "vendor" ? { _id: params.requestId, vendorId: session.user.id } : { _id: params.requestId }

    const refundRequest = await RequestRefund.findOneAndUpdate(
      query,
      {
        ...body,
        processedBy: session.user.id,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).populate([
      { path: "customerId", select: "name email" },
      { path: "vendorId", select: "businessName email" },
      { path: "orderId", select: "orderNumber totalAmount" },
    ])

    if (!refundRequest) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
    }

    return NextResponse.json({ refundRequest })
  } catch (error) {
    console.error("Error updating refund request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const refundRequest = await RequestRefund.findByIdAndDelete(params.requestId)

    if (!refundRequest) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Refund request deleted successfully" })
  } catch (error) {
    console.error("Error deleting refund request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { field, value } = await request.json()

    if (!field) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 })
    }

    await connectDB()

    const query =
      session.user.role === "vendor" ? { _id: params.requestId, vendorId: session.user.id } : { _id: params.requestId }

    const updateData = {
      [field]: value,
      updatedAt: new Date(),
      processedBy: session.user.id,
      processedAt: new Date(),
    }

    const refundRequest = await RequestRefund.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "customerId", select: "name email" },
      { path: "vendorId", select: "businessName email" },
      { path: "orderId", select: "orderNumber totalAmount" },
    ])

    if (!refundRequest) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
    }

    return NextResponse.json({ refundRequest })
  } catch (error) {
    console.error("Error patching refund request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, data } = await request.json()

    await connectDB()

    const query =
      session.user.role === "vendor" ? { _id: params.requestId, vendorId: session.user.id } : { _id: params.requestId }

    const refundRequest = await RequestRefund.findOne(query)
    if (!refundRequest) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 })
    }

    switch (action) {
      case "approve":
        if (refundRequest.requestStatus !== "pending") {
          return NextResponse.json({ error: "Request is not pending" }, { status: 400 })
        }

        refundRequest.requestStatus = "accepted"
        refundRequest.processedBy = session.user.id
        refundRequest.processedAt = new Date()
        refundRequest.adminNotes = data?.notes || "Request approved"
        await refundRequest.save()

        return NextResponse.json({
          message: "Refund request approved",
          refundRequest,
        })

      case "reject":
        if (refundRequest.requestStatus !== "pending") {
          return NextResponse.json({ error: "Request is not pending" }, { status: 400 })
        }

        refundRequest.requestStatus = "rejected"
        refundRequest.processedBy = session.user.id
        refundRequest.processedAt = new Date()
        refundRequest.adminNotes = data?.reason || "Request rejected"
        await refundRequest.save()

        return NextResponse.json({
          message: "Refund request rejected",
          refundRequest,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing refund request action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

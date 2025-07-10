import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Vendor } from "@/models/vendor"

/**
 * API route specifically for fetching pending vendor requests
 * This route is designed for admin dashboard to easily get pending vendor approvals
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can access pending vendor requests
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    
    // Always filter for pending vendors
    const query = {
      accountStatus: "under_review",
      isApproved: false
    }

    const skip = (page - 1) * limit

    // Get pending vendors with pagination
    const pendingVendors = await Vendor.find(query)
      .select("-password") // Exclude sensitive data
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Newest first

    // Get total count for pagination
    const total = await Vendor.countDocuments(query)

    return NextResponse.json({
      success: true,
      pendingVendors,
      count: pendingVendors.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching pending vendor requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

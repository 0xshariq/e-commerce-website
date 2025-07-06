import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Vendor } from "@/models/vendor"
import { Product } from "@/models/product"

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
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") // pending, active, suspended
    const category = searchParams.get("category")

    // Build query
    let query: any = {}
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "businessInfo.description": { $regex: search, $options: "i" } }
      ]
    }

    if (status) {
      query.status = status
    }

    if (category) {
      query["businessInfo.category"] = category
    }

    // If not admin, only show their own vendor data
    if (session.user.role === "vendor") {
      query._id = session.user.id
    }

    const skip = (page - 1) * limit

    const vendors = await Vendor.find(query)
      .select("-otp -otpExpiry")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Vendor.countDocuments(query)

    // Get additional stats for each vendor
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const productCount = await Product.countDocuments({ vendorId: vendor._id })
        const activeProducts = await Product.countDocuments({ 
          vendorId: vendor._id, 
          status: "active" 
        })

        return {
          ...vendor.toObject(),
          stats: {
            totalProducts: productCount,
            activeProducts,
            // Add more stats as needed
          }
        }
      })
    )

    return NextResponse.json({
      vendors: vendorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const vendorData = await request.json()

    const vendor = new Vendor({
      ...vendorData,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await vendor.save()

    return NextResponse.json({ 
      success: true, 
      message: "Vendor created successfully",
      vendor: vendor.toObject()
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating vendor:", error)
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

    const { vendorId, action, data } = await request.json()

    if (!vendorId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check permissions
    if (session.user.role === "vendor" && session.user.id !== vendorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let result

    switch (action) {
      case "approve":
        if (session.user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
        result = await Vendor.findByIdAndUpdate(
          vendorId,
          { 
            status: "active",
            approvedAt: new Date(),
            approvedBy: session.user.id
          },
          { new: true }
        )
        break
      
      case "reject":
        if (session.user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
        result = await Vendor.findByIdAndUpdate(
          vendorId,
          { 
            status: "rejected",
            rejectedAt: new Date(),
            rejectedBy: session.user.id,
            rejectionReason: data?.reason || "Not specified"
          },
          { new: true }
        )
        break
      
      case "suspend":
        if (session.user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
        result = await Vendor.findByIdAndUpdate(
          vendorId,
          { 
            status: "suspended",
            suspendedAt: new Date(),
            suspendedBy: session.user.id,
            suspensionReason: data?.reason || "Not specified"
          },
          { new: true }
        )
        break
      
      case "update":
        const allowedFields = session.user.role === "admin" 
          ? Object.keys(data) // Admin can update anything
          : ["businessName", "businessInfo", "contactInfo", "settings"] // Vendor can only update these

        const updateData: any = {}
        allowedFields.forEach(field => {
          if (data[field] !== undefined) {
            updateData[field] = data[field]
          }
        })

        updateData.updatedAt = new Date()

        result = await Vendor.findByIdAndUpdate(
          vendorId,
          updateData,
          { new: true, runValidators: true }
        )
        break
      
      case "delete":
        if (session.user.role !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
        result = await Vendor.findByIdAndDelete(vendorId)
        break
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Vendor ${action}ed successfully`,
      vendor: result
    })

  } catch (error) {
    console.error("Error updating vendor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

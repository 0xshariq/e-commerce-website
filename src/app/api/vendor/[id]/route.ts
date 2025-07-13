import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Vendor } from "@/models/vendor"
import { Product } from "@/models/product"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const vendorId = (await params).id
    
    // Security check: Regular vendors can only access their own data
    if (session.user.role === "vendor" && session.user.id !== vendorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Fetch vendor data
    const vendor = await Vendor.findById(vendorId).select("-otp -otpExpiry")
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }
    
    // Get additional stats
    const productCount = await Product.countDocuments({ vendorId })
    const activeProducts = await Product.countDocuments({ 
      vendorId, 
      status: "active" 
    })
    
    const vendorWithStats = {
      ...vendor.toObject(),
      stats: {
        totalProducts: productCount,
        activeProducts,
      }
    }
    
    return NextResponse.json({ vendor: vendorWithStats })
    
  } catch (error) {
    console.error("Error fetching vendor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    await connectDB()
    
    const vendorId = params.id
    
    // Security check: Regular vendors can only update their own data
    if (session.user.role === "vendor" && session.user.id !== vendorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const updateData = await request.json()
    
    // Determine which fields are allowed to be updated based on user role
    const allowedFields = session.user.role === "admin" 
      ? Object.keys(updateData) // Admin can update anything
      : ["personalInfo", "businessInfo", "address", "paymentInfo", "preferences", "bankAccountInfo"] 

    const filteredUpdate = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as Record<string, any>)
    
    // Add updated timestamp
    filteredUpdate.updatedAt = new Date()
    
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: filteredUpdate },
      { new: true }
    ).select("-otp -otpExpiry")
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Vendor updated successfully",
      vendor: vendor.toObject()
    })
    
  } catch (error) {
    console.error("Error updating vendor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

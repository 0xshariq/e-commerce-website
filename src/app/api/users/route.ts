import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("type") // customer, vendor, admin
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    // Only admin can access all users, others can only access their own data
    if (session.user.role !== "admin" && userType !== session.user.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const skip = (page - 1) * limit

    const users: any[] = []
    let total = 0

    if (!userType || userType === "customer") {
      const customerQuery = search 
        ? { $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]}
        : {}
      
      const customers = await Customer.find(customerQuery)
        .select("-otp -otpExpiry")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
      
      const customerCount = await Customer.countDocuments(customerQuery)
      
      users.push(...customers.map(c => ({ ...c.toObject(), role: "customer" })))
      total += customerCount
    }

    if (!userType || userType === "vendor") {
      const vendorQuery = search 
        ? { $or: [
            { businessName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]}
        : {}
      
      const vendors = await Vendor.find(vendorQuery)
        .select("-otp -otpExpiry")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
      
      const vendorCount = await Vendor.countDocuments(vendorQuery)
      
      users.push(...vendors.map(v => ({ ...v.toObject(), role: "vendor" })))
      total += vendorCount
    }

    if (!userType || userType === "admin") {
      const adminQuery = search 
        ? { $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]}
        : {}
      
      const admins = await Admin.find(adminQuery)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
      
      const adminCount = await Admin.countDocuments(adminQuery)
      
      users.push(...admins.map(a => ({ ...a.toObject(), role: "admin" })))
      total += adminCount
    }

    return NextResponse.json({
      users: users.slice(0, limit), // Ensure we don't exceed limit
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { userId, userType, action, data } = await request.json()

    if (!userId || !userType || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result
    let Model

    switch (userType) {
      case "customer":
        Model = Customer
        break
      case "vendor":
        Model = Vendor
        break
      case "admin":
        Model = Admin
        break
      default:
        return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    switch (action) {
      case "activate":
        result = await Model.findByIdAndUpdate(
          userId,
          { status: "active" },
          { new: true }
        )
        break
      
      case "suspend":
        result = await Model.findByIdAndUpdate(
          userId,
          { status: "suspended" },
          { new: true }
        )
        break
      
      case "update":
        result = await Model.findByIdAndUpdate(
          userId,
          data,
          { new: true, runValidators: true }
        )
        break
      
      case "delete":
        result = await Model.findByIdAndDelete(userId)
        break
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${action}ed successfully`,
      user: result
    })

  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

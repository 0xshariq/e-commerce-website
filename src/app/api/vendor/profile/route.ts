import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Vendor, VendorUpdateZodSchema } from "@/models/vendor"
import { sanitizeInput, getSecureHeaders } from "@/utils/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "vendor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    await connectDB()

    const vendor = await Vendor.findById(session.user.id)
      .select('-password')
      .lean()

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        profile: {
          ...vendor,
          role: "vendor"
        },
        success: true
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Vendor profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecureHeaders() }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "vendor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    const body = await request.json()

    // Validate with Zod schema
    const validation = VendorUpdateZodSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validation.error.errors 
        },
        { status: 400, headers: getSecureHeaders() }
      )
    }

    await connectDB()

    const updatedVendor = await Vendor.findByIdAndUpdate(
      session.user.id,
      validation.data,
      { new: true, runValidators: true }
    ).select('-password').lean()

    if (!updatedVendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        profile: {
          ...updatedVendor,
          role: "vendor"
        },
        success: true,
        message: "Vendor profile updated successfully"
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Vendor profile update error:", error)
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: validationErrors.join(", ") },
        { status: 400, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecureHeaders() }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "vendor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    const body = await request.json()
    const { field, value } = body

    if (!field) {
      return NextResponse.json(
        { error: "Field is required" },
        { status: 400, headers: getSecureHeaders() }
      )
    }

    await connectDB()

    const updateData = { [field]: value }
    const updatedVendor = await Vendor.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean()

    if (!updatedVendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        profile: {
          ...updatedVendor,
          role: "vendor"
        },
        success: true,
        message: `${field} updated successfully`
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Vendor profile patch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecureHeaders() }
    )
  }
}

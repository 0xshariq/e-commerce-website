import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Customer, CustomerUpdateZodSchema } from "@/models/customer"
import { sanitizeInput, getSecureHeaders } from "@/utils/auth"
import { uploadProfileImage, getDefaultAvatarUrl } from "@/utils/upload"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    await connectDB()

    const customer = await Customer.findById(session.user.id)
      .select('-password')
      .lean()

    if (!customer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        profile: {
          ...customer,
          role: "customer"
        },
        success: true
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Customer profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecureHeaders() }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    const contentType = request.headers.get("content-type")
    let body: any = {}
    let profileImageFile: File | null = null

    // Handle both JSON and FormData
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      
      // Extract profile image if present
      profileImageFile = formData.get("profileImage") as File
      
      // Extract other fields
      for (const [key, value] of formData.entries()) {
        if (key !== "profileImage") {
          body[key] = value
        }
      }
    } else {
      body = await request.json()
    }

    // Validate with Zod schema (excluding profileImage)
    const validation = CustomerUpdateZodSchema.safeParse(body)
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

    // Get current customer for old profile image
    const currentCustomer = await Customer.findById(session.user.id).select('profileImage firstName lastName')
    if (!currentCustomer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    const updateData = { ...validation.data }

    // Handle profile image upload if provided
    if (profileImageFile && profileImageFile.size > 0) {
      const uploadResult = await uploadProfileImage(
        profileImageFile,
        'customer',
        session.user.id,
        currentCustomer.profileImage
      )

      if (uploadResult.success) {
        updateData.profileImage = uploadResult.cloudinaryUrl || uploadResult.publicUrl
      } else {
        return NextResponse.json(
          { error: uploadResult.message },
          { status: 400, headers: getSecureHeaders() }
        )
      }
    }

    // If no profile image set, use default avatar
    if (!updateData.profileImage && !currentCustomer.profileImage) {
      const customerName = `${updateData.firstName || currentCustomer.firstName} ${updateData.lastName || currentCustomer.lastName}`
      updateData.profileImage = getDefaultAvatarUrl(customerName, 'customer')
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean()

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        profile: {
          ...updatedCustomer,
          role: "customer"
        },
        success: true,
        message: "Customer profile updated successfully"
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Customer profile update error:", error)
    
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
    
    if (!session || !session.user || session.user.role !== "customer") {
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
    const updatedCustomer = await Customer.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean()

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        profile: {
          ...updatedCustomer,
          role: "customer"
        },
        success: true,
        message: `${field} updated successfully`
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Customer profile patch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecureHeaders() }
    )
  }
}

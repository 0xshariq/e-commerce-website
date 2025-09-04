import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Vendor, VendorUpdateZodSchema } from "@/models/vendor"
import { sanitizeInput, getSecureHeaders } from "@/utils/auth"
import { uploadProfileImage, getDefaultAvatarUrl } from "@/utils/upload"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== "vendor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    await connectDB()

    const vendor = await Vendor.findById((session.user as any).id)
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
    
    if (!session || !session.user || (session.user as any).role !== "vendor") {
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

    // Get current vendor for old profile image
    const currentVendor = await Vendor.findById((session.user as any).id).select('profileImage businessInfo.businessName firstName lastName')
    if (!currentVendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    const updateData = { ...validation.data }

    // Handle profile image upload if provided
    if (profileImageFile && profileImageFile.size > 0) {
      const uploadResult = await uploadProfileImage(
        profileImageFile,
        'vendor',
        (session.user as any).id,
        currentVendor.profileImage
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
    if (!updateData.profileImage && !currentVendor.profileImage) {
      const vendorName = updateData.businessInfo?.businessName || 
                        currentVendor.businessInfo?.businessName || 
                        `${updateData.firstName || currentVendor.firstName} ${updateData.lastName || currentVendor.lastName}`
      updateData.profileImage = getDefaultAvatarUrl(vendorName, 'vendor')
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      (session.user as any).id,
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
    
    if (!session || !session.user || (session.user as any).role !== "vendor") {
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
      (session.user as any).id,
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

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"
import { sanitizeInput, getSecureHeaders } from "@/utils/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    await connectDB()

    let profile
    const { id, role } = session.user

    switch (role) {
      case "customer":
        profile = await Customer.findById(id).select('-password').lean()
        break
      case "vendor":
        profile = await Vendor.findById(id).select('-password').lean()
        break
      case "admin":
        profile = await Admin.findById(id).select('-password').lean()
        break
      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400, headers: getSecureHeaders() }
        )
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    // Add role to profile response
    profile.role = role

    return NextResponse.json(
      {
        profile,
        success: true
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecureHeaders() }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: getSecureHeaders() }
      )
    }

    const body = await request.json()
    const { id, role } = session.user

    await connectDB()

    let updatedProfile
    let updateData: any = {}

    // Handle different user roles
    switch (role) {
      case "customer":
        // Customer-specific fields
        if (body.name) updateData.name = sanitizeInput(body.name)
        if (body.email) updateData.email = sanitizeInput(body.email).toLowerCase()
        if (body.mobileNo) updateData.mobileNo = sanitizeInput(body.mobileNo)
        if (body.dateOfBirth) updateData.dateOfBirth = new Date(body.dateOfBirth)
        if (body.gender) updateData.gender = sanitizeInput(body.gender)
        
        // Update addresses if provided
        if (body.addresses && Array.isArray(body.addresses)) {
          updateData.addresses = body.addresses.map((addr: any) => ({
            type: sanitizeInput(addr.type || 'home'),
            fullName: sanitizeInput(addr.fullName || ''),
            phoneNumber: sanitizeInput(addr.phoneNumber || ''),
            addressLine1: sanitizeInput(addr.addressLine1 || ''),
            addressLine2: addr.addressLine2 ? sanitizeInput(addr.addressLine2) : undefined,
            landmark: addr.landmark ? sanitizeInput(addr.landmark) : undefined,
            city: sanitizeInput(addr.city || ''),
            state: sanitizeInput(addr.state || ''),
            postalCode: sanitizeInput(addr.postalCode || ''),
            country: sanitizeInput(addr.country || 'India'),
            isDefault: Boolean(addr.isDefault)
          }))
        }

        updatedProfile = await Customer.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select('-password').lean()
        break

      case "vendor":
        // Vendor-specific fields
        if (body.name) updateData.name = sanitizeInput(body.name)
        if (body.email) updateData.email = sanitizeInput(body.email).toLowerCase()
        if (body.mobileNo) updateData.mobileNo = sanitizeInput(body.mobileNo)
        if (body.businessName) updateData.businessName = sanitizeInput(body.businessName)
        if (body.businessType) updateData.businessType = sanitizeInput(body.businessType)
        if (body.businessDescription) updateData.businessDescription = sanitizeInput(body.businessDescription)
        if (body.gstNumber) updateData.gstNumber = sanitizeInput(body.gstNumber.toUpperCase())
        if (body.panNumber) updateData.panNumber = sanitizeInput(body.panNumber.toUpperCase())
        if (body.upiId) updateData.upiId = sanitizeInput(body.upiId)
        
        // Handle nested address object
        if (body.address) {
          updateData.address = {
            street: body.address.street ? sanitizeInput(body.address.street) : '',
            city: body.address.city ? sanitizeInput(body.address.city) : '',
            state: body.address.state ? sanitizeInput(body.address.state) : '',
            zipCode: body.address.zipCode ? sanitizeInput(body.address.zipCode) : '',
            country: body.address.country ? sanitizeInput(body.address.country) : 'India'
          }
        }

        // Handle nested bank details object
        if (body.bankDetails) {
          updateData.bankDetails = {
            accountNumber: body.bankDetails.accountNumber ? sanitizeInput(body.bankDetails.accountNumber) : '',
            ifscCode: body.bankDetails.ifscCode ? sanitizeInput(body.bankDetails.ifscCode.toUpperCase()) : '',
            bankName: body.bankDetails.bankName ? sanitizeInput(body.bankDetails.bankName) : '',
            accountHolderName: body.bankDetails.accountHolderName ? sanitizeInput(body.bankDetails.accountHolderName) : ''
          }
        }

        updatedProfile = await Vendor.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select('-password').lean()
        break

      case "admin":
        if (body.name) updateData.name = sanitizeInput(body.name)
        if (body.email) updateData.email = sanitizeInput(body.email).toLowerCase()
        if (body.mobileNo) updateData.mobileNo = sanitizeInput(body.mobileNo)

        updatedProfile = await Admin.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select('-password').lean()
        break

      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400, headers: getSecureHeaders() }
        )
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    // Add role to response
    updatedProfile.role = role

    return NextResponse.json(
      {
        profile: updatedProfile,
        success: true,
        message: "Profile updated successfully"
      },
      { status: 200, headers: getSecureHeaders() }
    )

        // Update addresses if provided
        if (body.addresses && Array.isArray(body.addresses)) {
          updateData.addresses = body.addresses.map((addr: any) => ({
            type: sanitizeInput(addr.type || 'registered'),
            fullName: sanitizeInput(addr.fullName || ''),
            phoneNumber: sanitizeInput(addr.phoneNumber || ''),
            addressLine1: sanitizeInput(addr.addressLine1 || ''),
            addressLine2: addr.addressLine2 ? sanitizeInput(addr.addressLine2) : undefined,
            landmark: addr.landmark ? sanitizeInput(addr.landmark) : undefined,
            city: sanitizeInput(addr.city || ''),
            state: sanitizeInput(addr.state || ''),
            postalCode: sanitizeInput(addr.postalCode || ''),
            country: sanitizeInput(addr.country || 'India'),
            isDefault: Boolean(addr.isDefault)
          }))
        }

        if (body.upiId) updateData.upiId = sanitizeInput(body.upiId)

        // Update settings if provided
        if (body.settings) {
          updateData.settings = {
            ...updateData.settings,
            ...body.settings
          }
        }
        break

      case "admin":
        userModel = Admin
        
        // Update settings if provided
        if (body.settings) {
          updateData.settings = {
            ...updateData.settings,
            ...body.settings
          }
        }
        break

      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400, headers: getSecureHeaders() }
        )
    }

    // Update the user
    user = await userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: user.toObject()
      },
      { status: 200, headers: getSecureHeaders() }
    )

  } catch (error) {
    console.error("Profile update error:", error)
    
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

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

    let user
    let userModel
    const { id, role } = session.user

    switch (role) {
      case "customer":
        user = await Customer.findById(id).select('-password')
        userModel = Customer
        break
      case "vendor":
        user = await Vendor.findById(id).select('-password')
        userModel = Vendor
        break
      case "admin":
        user = await Admin.findById(id).select('-password')
        userModel = Admin
        break
      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400, headers: getSecureHeaders() }
        )
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: getSecureHeaders() }
      )
    }

    return NextResponse.json(
      {
        user: user.toObject(),
        role
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

    let user
    let userModel
    let updateData: any = {}

    // Common fields for all roles
    if (body.firstName) updateData.firstName = sanitizeInput(body.firstName)
    if (body.lastName) updateData.lastName = sanitizeInput(body.lastName)
    if (body.email) updateData.email = sanitizeInput(body.email).toLowerCase()
    if (body.mobileNo) updateData.mobileNo = sanitizeInput(body.mobileNo)

    switch (role) {
      case "customer":
        userModel = Customer
        
        // Customer-specific fields
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

        // Update preferences if provided
        if (body.preferences) {
          updateData.preferences = {
            ...updateData.preferences,
            ...body.preferences
          }
        }
        break

      case "vendor":
        userModel = Vendor
        
        // Vendor-specific fields
        if (body.alternatePhone) updateData.alternatePhone = sanitizeInput(body.alternatePhone)
        
        // Update business info if provided
        if (body.businessInfo) {
          updateData.businessInfo = {
            businessName: body.businessInfo.businessName ? sanitizeInput(body.businessInfo.businessName) : undefined,
            businessType: body.businessInfo.businessType ? sanitizeInput(body.businessInfo.businessType) : undefined,
            businessCategory: body.businessInfo.businessCategory ? sanitizeInput(body.businessInfo.businessCategory) : undefined,
            panNumber: body.businessInfo.panNumber ? sanitizeInput(body.businessInfo.panNumber.toUpperCase()) : undefined,
            gstNumber: body.businessInfo.gstNumber ? sanitizeInput(body.businessInfo.gstNumber.toUpperCase()) : undefined,
            businessEmail: body.businessInfo.businessEmail ? sanitizeInput(body.businessInfo.businessEmail).toLowerCase() : undefined,
            businessPhone: body.businessInfo.businessPhone ? sanitizeInput(body.businessInfo.businessPhone) : undefined,
            businessRegistrationNumber: body.businessInfo.businessRegistrationNumber ? sanitizeInput(body.businessInfo.businessRegistrationNumber) : undefined,
            yearEstablished: body.businessInfo.yearEstablished ? parseInt(body.businessInfo.yearEstablished) : undefined,
          }
        }

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

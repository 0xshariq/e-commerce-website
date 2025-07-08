import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"
import {
  generateVerificationToken,
  generateVerificationCode,
  sanitizeInput,
  validatePasswordStrength,
  validateEmail,
  validateMobileNumber,
  validatePAN,
  validateGST,
  validateUPI,
  validatePostalCode,
  getSecureHeaders
} from "@/utils/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { 
      firstName,
      lastName,
      email, 
      password, 
      mobileNo,
      role,
      // Verification preference
      verificationPreference = 'email', // 'email' or 'mobile'
      // Admin specific fields
      adminKey,
      // Customer specific fields
      dateOfBirth,
      gender,
      // Vendor specific fields
      businessName,
      businessType,
      businessCategory,
      panNumber,
      gstNumber,
      businessEmail,
      businessPhone,
      businessRegistrationNumber,
      yearEstablished,
      upiId,
      alternatePhone,
      // Address fields (for both customer and vendor)
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country = 'India'
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !mobileNo || !role) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, password, mobileNo, role" },
        { status: 400 }
      )
    }

    // Validate role
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be customer, vendor, or admin" },
        { status: 400 }
      )
    }

    // Validate admin registration key
    if (role === 'admin') {
      const validAdminKey = process.env.ADMIN_REGISTRATION_KEY
      if (!validAdminKey) {
        return NextResponse.json(
          { error: "Admin registration is currently disabled" },
          { status: 403 }
        )
      }
      if (!adminKey || adminKey !== validAdminKey) {
        return NextResponse.json(
          { error: "Invalid admin registration key" },
          { status: 403 }
        )
      }
    }

    // Validate verification preference
    if (!['email', 'mobile'].includes(verificationPreference)) {
      return NextResponse.json(
        { error: "Invalid verification preference. Must be 'email' or 'mobile'" },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate mobile number
    if (!validateMobileNumber(mobileNo)) {
      return NextResponse.json(
        { error: "Invalid mobile number format" },
        { status: 400 }
      )
    }

    // Role-specific validation
    if (role === 'vendor') {
      if (!businessName || !businessType || !businessCategory || !panNumber || !upiId) {
        return NextResponse.json(
          { error: "Missing required vendor fields: businessName, businessType, businessCategory, panNumber, upiId" },
          { status: 400 }
        )
      }

      // Validate PAN number format
      if (!validatePAN(panNumber)) {
        return NextResponse.json(
          { error: "Invalid PAN number format" },
          { status: 400 }
        )
      }

      // Validate GST number format if provided
      if (gstNumber && !validateGST(gstNumber)) {
        return NextResponse.json(
          { error: "Invalid GST number format" },
          { status: 400 }
        )
      }

      // Validate UPI ID format
      if (!validateUPI(upiId)) {
        return NextResponse.json(
          { error: "Invalid UPI ID format" },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Check if user exists across all models (only check email)
    const existingCustomer = await Customer.findOne({ email })
    const existingVendor = await Vendor.findOne({ email })
    const existingAdmin = await Admin.findOne({ email })

    if (existingCustomer || existingVendor || existingAdmin) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification tokens
    const verificationToken = generateVerificationToken()
    const emailVerificationCode = generateVerificationCode()
    const mobileVerificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const mobileVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    let newUser: any

    switch (role) {
      case "customer":
        // Prepare address array if address fields are provided
        const customerAddresses = []
        if (addressLine1 && city && state && postalCode) {
          customerAddresses.push({
            type: 'home',
            fullName: `${firstName} ${lastName}`,
            phoneNumber: mobileNo,
            addressLine1: sanitizeInput(addressLine1),
            addressLine2: addressLine2 ? sanitizeInput(addressLine2) : undefined,
            landmark: landmark ? sanitizeInput(landmark) : undefined,
            city: sanitizeInput(city),
            state: sanitizeInput(state),
            postalCode: sanitizeInput(postalCode),
            country: sanitizeInput(country),
            isDefault: true
          })
        }

        newUser = new Customer({
          firstName: sanitizeInput(firstName),
          lastName: sanitizeInput(lastName),
          email: sanitizeInput(email).toLowerCase(),
          password: hashedPassword,
          mobileNo: sanitizeInput(mobileNo),
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender,
          isEmailVerified: false,
          isMobileVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationCode: emailVerificationCode,
          emailVerificationExpiry: verificationExpiry,
          mobileVerificationCode: mobileVerificationCode,
          mobileVerificationExpiry: mobileVerificationExpiry,
          accountStatus: 'active',
          addresses: customerAddresses,
          orders: [],
          wishlist: [],
          cart: [],
          recentlyViewed: [],
          paymentMethods: [],
          preferences: {
            language: 'en',
            currency: 'INR',
            notifications: {
              email: true,
              sms: true,
              push: true,
              orderUpdates: true,
              promotions: false,
              recommendations: true
            },
            privacy: {
              profileVisibility: 'private',
              activityTracking: true,
              dataSharing: false
            }
          },
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          loyaltyPoints: 0,
          membershipTier: 'bronze'
        })
        break

      case "vendor":
        // Prepare address array if address fields are provided
        const vendorAddresses = []
        if (addressLine1 && city && state && postalCode) {
          vendorAddresses.push({
            type: 'registered',
            fullName: `${firstName} ${lastName}`,
            phoneNumber: businessPhone || mobileNo,
            addressLine1: sanitizeInput(addressLine1),
            addressLine2: addressLine2 ? sanitizeInput(addressLine2) : undefined,
            landmark: landmark ? sanitizeInput(landmark) : undefined,
            city: sanitizeInput(city),
            state: sanitizeInput(state),
            postalCode: sanitizeInput(postalCode),
            country: sanitizeInput(country),
            isDefault: true
          })
        }

        newUser = new Vendor({
          firstName: sanitizeInput(firstName),
          lastName: sanitizeInput(lastName),
          email: sanitizeInput(email).toLowerCase(),
          password: hashedPassword,
          mobileNo: sanitizeInput(mobileNo),
          alternatePhone: alternatePhone ? sanitizeInput(alternatePhone) : undefined,
          isEmailVerified: false,
          isMobileVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationCode: emailVerificationCode,
          emailVerificationExpiry: verificationExpiry,
          mobileVerificationCode: mobileVerificationCode,
          mobileVerificationExpiry: mobileVerificationExpiry,
          businessInfo: {
            businessName: sanitizeInput(businessName),
            businessType: sanitizeInput(businessType),
            businessCategory: sanitizeInput(businessCategory),
            panNumber: sanitizeInput(panNumber.toUpperCase()),
            gstNumber: gstNumber ? sanitizeInput(gstNumber.toUpperCase()) : undefined,
            businessEmail: businessEmail ? sanitizeInput(businessEmail).toLowerCase() : undefined,
            businessPhone: businessPhone ? sanitizeInput(businessPhone) : undefined,
            businessRegistrationNumber: businessRegistrationNumber ? sanitizeInput(businessRegistrationNumber) : undefined,
            yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
          },
          addresses: vendorAddresses,
          upiId: sanitizeInput(upiId),
          isApproved: false,
          isBusinessVerified: false,
          isGSTVerified: false,
          accountStatus: 'under_review',
          products: [],
          categories: [],
          totalProducts: 0,
          activeProducts: 0,
          orders: [],
          performanceMetrics: {
            totalSales: 0,
            totalOrders: 0,
            averageRating: 0,
            totalReviews: 0,
            responseTime: 24,
            returnRate: 0,
            cancellationRate: 0,
            onTimeDeliveryRate: 100
          },
          settings: {
            autoAcceptOrders: true,
            maxOrdersPerDay: 100,
            workingHours: {
              start: '09:00',
              end: '18:00',
              workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            notifications: {
              orderAlerts: true,
              paymentAlerts: true,
              inventoryAlerts: true,
              promotionalEmails: false
            }
          },
          documents: []
        })
        break

      case "admin":
        newUser = new Admin({
          firstName: sanitizeInput(firstName),
          lastName: sanitizeInput(lastName),
          email: sanitizeInput(email).toLowerCase(),
          password: hashedPassword,
          mobileNo: sanitizeInput(mobileNo),
          isActive: true,
          isEmailVerified: false,
          isMobileVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationCode: emailVerificationCode,
          emailVerificationExpiry: verificationExpiry,
          mobileVerificationCode: mobileVerificationCode,
          mobileVerificationExpiry: mobileVerificationExpiry,
          lastPasswordChange: new Date(),
          loginAttempts: 0,
          activityLogs: [],
          totalActions: 0,
          totalLogins: 0,
          settings: {
            timezone: 'Asia/Kolkata',
            language: 'en',
            emailNotifications: true,
            smsNotifications: false,
            dashboardLayout: 'default',
            theme: 'light'
          }
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid role specified" },
          { status: 400 }
        )
    }

    // Save the user
    await newUser.save()

    // Log verification codes in development
    console.log(`📧 Email verification code for ${email}: ${emailVerificationCode}`)
    console.log(`📱 SMS verification code for ${mobileNo}: ${mobileVerificationCode}`)

    // Prepare response (remove sensitive data)
    const userResponse = newUser.toObject()
    delete userResponse.password
    delete userResponse.emailVerificationToken
    delete userResponse.emailVerificationCode
    delete userResponse.mobileVerificationCode

    const responseUser: any = {
      id: userResponse._id,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      email: userResponse.email,
      mobileNo: userResponse.mobileNo,
      role,
      isEmailVerified: userResponse.isEmailVerified,
      isMobileVerified: userResponse.isMobileVerified,
      createdAt: userResponse.createdAt
    }

    // Add role-specific fields to response
    if (role === 'vendor') {
      responseUser.isApproved = userResponse.isApproved
      responseUser.accountStatus = userResponse.accountStatus
      responseUser.businessName = userResponse.businessInfo?.businessName
      responseUser.isBusinessVerified = userResponse.isBusinessVerified
      responseUser.isGSTVerified = userResponse.isGSTVerified
    } else if (role === 'admin') {
      responseUser.isActive = userResponse.isActive
      responseUser.lastPasswordChange = userResponse.lastPasswordChange
    } else if (role === 'customer') {
      responseUser.accountStatus = userResponse.accountStatus
      responseUser.membershipTier = userResponse.membershipTier
      responseUser.totalOrders = userResponse.totalOrders
      responseUser.loyaltyPoints = userResponse.loyaltyPoints
    }

    // Close database connection
    await mongoose.disconnect()

    return NextResponse.json(
      { 
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
        user: responseUser,
        verification: {
          emailSent: true,
          mobileSent: true,
          instructions: "Please check your email and mobile for verification codes (check console in development)."
        }
      },
      { status: 201 }
    )

  } catch (error: unknown) {
    console.error("Registration error:", error)
    
    // Close database connection in case of error
    try {
      await mongoose.disconnect()
    } catch (disconnectError) {
      console.error("Database disconnect error:", disconnectError)
    }
    
    // Handle mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: validationErrors.join(", ") },
        { status: 400 }
      )
    }

    // Handle duplicate key errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email or mobile number already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    )
  }
}

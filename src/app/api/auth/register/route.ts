import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

// Utility function to sanitize input
function sanitizeInput(input: string): string {
  return input.toString().trim().replace(/[<>]/g, '')
}

// Utility function to validate phone number format
function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

// Utility function to check password strength
function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }
  
  return { isValid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Add security headers
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    const body = await request.json()
    
    // Handle cases where body might be empty or malformed
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers }
      )
    }

    const { 
      firstName,
      lastName,
      name, // For backward compatibility
      email, 
      password, 
      phone,
      mobileNo, // Keep backward compatibility
      role,
      dateOfBirth,
      gender,
      
      // Customer specific
      address,
      
      // Vendor specific
      businessName,
      businessType,
      businessCategory,
      panNumber,
      gstNumber,
      businessAddress,
      businessEmail,
      businessPhone,
      shopAddress,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      accountType,
      
      // Admin specific
      employeeId,
      designation,
      department,
      workLocation
    } = body

    // Parse names for backward compatibility
    let parsedFirstName = firstName
    let parsedLastName = lastName
    
    if (!firstName && !lastName && name) {
      const nameParts = name.trim().split(' ')
      parsedFirstName = nameParts[0]
      parsedLastName = nameParts.slice(1).join(' ') || nameParts[0]
    }

    // Validate required fields
    if (!parsedFirstName || !parsedLastName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName (or name), email, password, role" },
        { status: 400, headers }
      )
    }

    // Sanitize inputs
    const sanitizedFirstName = sanitizeInput(parsedFirstName)
    const sanitizedLastName = sanitizeInput(parsedLastName)
    const sanitizedEmail = sanitizeInput(email).toLowerCase()
    
    // Use phone or mobileNo for backward compatibility
    const phoneNumber = phone || mobileNo

    // Validate phone number
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Valid phone number is required" },
        { status: 400, headers }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400, headers }
      )
    }

    // Validate name lengths
    if (sanitizedFirstName.length < 2 || sanitizedFirstName.length > 30) {
      return NextResponse.json(
        { error: "First name must be between 2 and 30 characters" },
        { status: 400, headers }
      )
    }

    if (sanitizedLastName.length < 1 || sanitizedLastName.length > 30) {
      return NextResponse.json(
        { error: "Last name must be between 1 and 30 characters" },
        { status: 400, headers }
      )
    }

    // Validate role
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified. Must be customer, vendor, or admin" },
        { status: 400, headers }
      )
    }

    await dbConnect()

    // Check if user already exists in any collection
    const existingCustomer = await Customer.findOne({ email: sanitizedEmail })
    const existingVendor = await Vendor.findOne({ email: sanitizedEmail })
    const existingAdmin = await Admin.findOne({ email: sanitizedEmail })

    if (existingCustomer || existingVendor || existingAdmin) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409, headers }
      )
    }

    // Hash password with higher cost for better security
    const hashedPassword = await bcrypt.hash(password, 14)

    // Create user based on role
    let newUser
    let message = "Account created successfully!"

    switch (role) {
      case "customer":
        // Create basic address if provided
        const customerAddresses = []
        if (address) {
          const addressParts = address.split(',').map((part: string) => part.trim())
          customerAddresses.push({
            type: 'home',
            fullName: `${sanitizedFirstName} ${sanitizedLastName}`,
            addressLine1: addressParts[0] || address,
            city: addressParts[1] || 'Not specified',
            state: addressParts[2] || 'Not specified',
            postalCode: addressParts[3] || '000000',
            country: 'India',
            phoneNumber: phoneNumber,
            isDefault: true
          })
        }

        newUser = new Customer({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          password: hashedPassword,
          mobileNo: phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender,
          addresses: customerAddresses,
          cart: [],
          wishlist: [],
          orders: [],
          recentlyViewed: [],
          paymentMethods: [],
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          loyaltyPoints: 0,
          membershipTier: 'bronze'
        })
        break

      case "vendor":
        // Validate vendor-specific required fields
        if (!businessName || !businessType || !businessCategory || !panNumber) {
          return NextResponse.json(
            { error: "Business name, business type, business category, and PAN number are required for vendor accounts" },
            { status: 400, headers }
          )
        }

        if (!accountHolderName || !accountNumber || !ifscCode || !bankName || !branchName || !accountType) {
          return NextResponse.json(
            { error: "Complete bank details are required for vendor accounts" },
            { status: 400, headers }
          )
        }

        const vendorShopAddress = shopAddress || businessAddress
        if (!vendorShopAddress) {
          return NextResponse.json(
            { error: "Shop address is required for vendor accounts" },
            { status: 400, headers }
          )
        }

        // Create business address
        const addressParts = vendorShopAddress.split(',').map((part: string) => part.trim())
        const vendorAddresses = [{
          type: 'registered',
          addressLine1: addressParts[0] || vendorShopAddress,
          city: addressParts[1] || 'Not specified',
          state: addressParts[2] || 'Not specified',
          postalCode: addressParts[3] || '000000',
          country: 'India',
          isDefault: true
        }]

        newUser = new Vendor({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          password: hashedPassword,
          mobileNo: phoneNumber,
          businessInfo: {
            businessName: sanitizeInput(businessName),
            businessType: businessType,
            businessCategory: sanitizeInput(businessCategory),
            panNumber: sanitizeInput(panNumber.toUpperCase()),
            gstNumber: gstNumber ? sanitizeInput(gstNumber.toUpperCase()) : undefined,
            businessEmail: businessEmail ? sanitizeInput(businessEmail).toLowerCase() : undefined,
            businessPhone: businessPhone || undefined
          },
          addresses: vendorAddresses,
          bankDetails: {
            accountHolderName: sanitizeInput(accountHolderName),
            accountNumber: sanitizeInput(accountNumber),
            ifscCode: sanitizeInput(ifscCode.toUpperCase()),
            bankName: sanitizeInput(bankName),
            branchName: sanitizeInput(branchName),
            accountType: accountType,
            isVerified: false
          },
          upiId: upiId ? sanitizeInput(upiId) : undefined,
          products: [],
          categories: [],
          orders: [],
          documents: [],
          totalProducts: 0,
          activeProducts: 0,
          isApproved: false,
          accountStatus: 'under_review'
        })
        message = "Vendor account created! Pending verification and approval."
        break

      case "admin":
        // Validate admin-specific required fields
        if (!designation) {
          return NextResponse.json(
            { error: "Designation is required for admin accounts" },
            { status: 400, headers }
          )
        }

        // Set default permissions based on role
        const defaultPermissions = [
          { module: 'users', actions: ['read'] },
          { module: 'vendors', actions: ['read'] },
          { module: 'products', actions: ['read'] },
          { module: 'orders', actions: ['read'] }
        ]

        newUser = new Admin({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          password: hashedPassword,
          mobileNo: phoneNumber,
          employeeId: employeeId ? sanitizeInput(employeeId.toUpperCase()) : undefined,
          role: 'admin',
          department: department || 'general',
          designation: sanitizeInput(designation),
          workLocation: workLocation || 'office',
          permissions: defaultPermissions,
          isActive: true,
          accountStatus: 'active',
          joiningDate: new Date(),
          totalActions: 0,
          totalLogins: 0,
          loginAttempts: 0,
          activityLogs: [],
          emergencyContacts: []
        })
        message = "Admin account created successfully!"
        break

      default:
        return NextResponse.json(
          { error: "Invalid role specified. Must be customer, vendor, or admin" },
          { status: 400, headers }
        )
    }

    await newUser.save()

    // Remove password from response
    const userResponse = newUser.toObject()
    delete userResponse.password

    // Create a clean response object
    const responseUser = {
      id: userResponse._id,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      email: userResponse.email,
      mobileNo: userResponse.mobileNo,
      role,
      createdAt: userResponse.createdAt,
      ...(role === 'vendor' && { 
        isApproved: userResponse.isApproved,
        accountStatus: userResponse.accountStatus,
        businessName: userResponse.businessInfo?.businessName 
      }),
      ...(role === 'admin' && { 
        designation: userResponse.designation,
        department: userResponse.department,
        isActive: userResponse.isActive 
      })
    }

    return NextResponse.json(
      { 
        message,
        user: responseUser
      },
      { status: 201, headers }
    )

  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Add security headers to error responses
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')
    
    // Handle mongoose validation errors
    if (error?.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: validationErrors.join(", ") },
        { status: 400, headers }
      )
    }

    // Handle duplicate key errors
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409, headers }
      )
    }

    // Handle JSON parsing errors
    if (error?.name === "SyntaxError") {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    )
  }
}

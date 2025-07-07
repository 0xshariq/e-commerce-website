import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Email verification utility functions
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendVerificationEmail(email: string, verificationToken: string, verificationCode: string, role: string, firstName: string) {
  const companyName = process.env.COMPANY_NAME || 'ShopHub'
  const fromEmail = process.env.FROM_EMAIL || 'no-reply@shophub.com'
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  // Create the verification URL
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
  
  // Role-specific content
  const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1)
  const roleSpecificContent = {
    customer: {
      welcome: `Welcome to ${companyName}! Start shopping with confidence.`,
      benefits: `
        <li>🛍️ Access to exclusive deals and discounts</li>
        <li>📦 Fast and reliable delivery</li>
        <li>💝 Loyalty rewards program</li>
        <li>🔒 Secure payment processing</li>
      `
    },
    vendor: {
      welcome: `Welcome to ${companyName} Seller Hub! Start your business journey with us.`,
      benefits: `
        <li>🏪 Reach millions of customers</li>
        <li>📈 Advanced analytics and insights</li>
        <li>💰 Competitive commission rates</li>
        <li>🚀 Marketing and promotional support</li>
      `
    },
    admin: {
      welcome: `Welcome to ${companyName} Admin Portal! Your admin access is ready.`,
      benefits: `
        <li>👥 User management capabilities</li>
        <li>📊 Comprehensive dashboard</li>
        <li>🔧 System configuration tools</li>
        <li>📈 Analytics and reporting</li>
      `
    }
  }
  
  const content = roleSpecificContent[role as keyof typeof roleSpecificContent] || roleSpecificContent.customer

  const msg = {
    to: email,
    from: {
      email: fromEmail,
      name: companyName
    },
    subject: `Welcome to ${companyName} - Verify Your ${roleDisplayName} Account`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - ${companyName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${companyName}</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Verify Your ${roleDisplayName} Account</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello ${firstName}!</h2>
            
            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              ${content.welcome}
            </p>
            
            <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              To complete your registration and secure your account, please verify your email address using one of the methods below:
            </p>
            
            <!-- Verification Code Box -->
            <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
              <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Your verification code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 10px 0;">${verificationCode}</div>
              <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 12px;">Enter this code on the verification page</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: #ffffff; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666666; line-height: 1.6; margin: 30px 0 20px 0; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <!-- Benefits Section -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">What's next?</h3>
              <p style="color: #666666; margin: 0 0 15px 0; font-size: 14px;">Once verified, you'll have access to:</p>
              <ul style="color: #666666; padding-left: 20px; margin: 0; font-size: 14px; line-height: 1.8;">
                ${content.benefits}
              </ul>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>🔒 Security Notice:</strong> This verification code will expire in 24 hours. 
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">${companyName}</p>
            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
              This is an automated message. Please do not reply to this email.<br>
              Need help? Contact our support team.
            </p>
            <div style="margin-top: 20px;">
              <p style="color: #adb5bd; margin: 0; font-size: 11px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to ${companyName}, ${firstName}!
      
      ${content.welcome}
      
      To verify your ${roleDisplayName} account, please use this verification code: ${verificationCode}
      
      Or visit this link: ${verificationUrl}
      
      This code will expire in 24 hours.
      
      If you didn't create this account, please ignore this email.
      
      Best regards,
      The ${companyName} Team
    `
  }

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg)
      console.log(`✅ Verification email sent successfully to ${email} for ${role}`)
      return { success: true, provider: 'sendgrid' }
    } else {
      // Fallback to console logging if SendGrid is not configured
      console.log(`
        📧 EMAIL VERIFICATION (SendGrid not configured)
        ================================================
        To: ${email}
        Name: ${firstName}
        Role: ${role}
        Verification Code: ${verificationCode}
        Verification URL: ${verificationUrl}
        Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
        
        ⚠️  Configure SENDGRID_API_KEY in .env to enable actual email sending
      `)
      return { success: true, provider: 'console' }
    }
  } catch (error: unknown) {
    console.error('❌ SendGrid email error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Fallback to console logging
    console.log(`
      📧 EMAIL VERIFICATION (SendGrid failed, fallback to console)
      ============================================================
      To: ${email}
      Name: ${firstName}
      Role: ${role}
      Verification Code: ${verificationCode}
      Verification URL: ${verificationUrl}
      Error: ${errorMessage}
    `)
    
    throw new Error(`Email sending failed: ${errorMessage}`)
  }
}

// Utility function to sanitize input
function sanitizeInput(input: string): string {
  return input.toString().trim().replace(/[<>]/g, '')
}

// Utility function to validate phone number format
function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
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
      fullName,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      
      // Vendor specific
      businessName,
      businessType,
      businessCategory,
      panNumber,
      gstNumber,
      businessAddress,
      businessCity,
      businessState,
      businessPostalCode,
      businessEmail,
      businessPhone,
      upiId,
      
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

    await connectDB()

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

    // Generate email verification token and code
    const verificationToken = generateVerificationToken()
    const verificationCode = generateVerificationCode()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user based on role
    let newUser
    let message = "Account created successfully!"

    // Common verification fields for all roles
    const commonVerificationFields = {
      emailVerificationToken: verificationToken,
      emailVerificationCode: verificationCode,
      emailVerificationExpiry: verificationTokenExpiry,
      isEmailVerified: false, // Set to false by default, can be made required later
      // mobileVerificationCode: null, // For future mobile verification
      // isMobileVerified: false,
    }

    switch (role) {
      case "customer":
        // Create customer address if provided
        const customerAddresses = []
        if (addressLine1 && city && state && postalCode) {
          customerAddresses.push({
            type: 'home',
            fullName: fullName || `${sanitizedFirstName} ${sanitizedLastName}`,
            phoneNumber: phoneNumber,
            addressLine1: sanitizeInput(addressLine1),
            addressLine2: addressLine2 ? sanitizeInput(addressLine2) : undefined,
            landmark: landmark ? sanitizeInput(landmark) : undefined,
            city: sanitizeInput(city),
            state: sanitizeInput(state),
            postalCode: sanitizeInput(postalCode),
            country: country || 'India',
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
          membershipTier: 'bronze',
          ...commonVerificationFields
        })
        message = "Customer account created successfully! Please check your email for verification instructions."
        break

      case "vendor":
        console.log("🏪 Creating vendor account with data:", {
          businessName, businessType, businessCategory, panNumber, businessAddress, upiId
        })
        
        // Validate vendor-specific required fields
        if (!businessName || !businessType || !businessCategory || !panNumber || !businessAddress || !businessCity || !businessState || !businessPostalCode) {
          return NextResponse.json(
            { error: "Business name, business type, business category, PAN number, and complete business address are required for vendor accounts" },
            { status: 400, headers }
          )
        }
        if (!upiId) {
          return NextResponse.json(
            { error: "UPI ID is required for vendor accounts" },
            { status: 400, headers }
          )
        }

        // Validate business postal code format
        if (!/^\d{6}$/.test(businessPostalCode)) {
          return NextResponse.json(
            { error: "Please enter a valid 6-digit business postal code" },
            { status: 400, headers }
          )
        }

        // Validate and map business type
        const businessTypeMapping: { [key: string]: string } = {
          'retail': 'individual',
          'wholesale': 'partnership',
          'manufacturer': 'private_limited',
          'distributor': 'partnership',
          'service': 'individual',
          'other': 'individual'
        }
        
        const mappedBusinessType = businessTypeMapping[businessType] || 'individual'
        console.log("🔄 Mapped business type:", businessType, "->", mappedBusinessType)

        // Create business address
        const vendorAddresses = [{
          type: 'registered',
          fullName: `${sanitizedFirstName} ${sanitizedLastName}`,
          phoneNumber: businessPhone || phoneNumber,
          addressLine1: sanitizeInput(businessAddress),
          city: sanitizeInput(businessCity),
          state: sanitizeInput(businessState),
          postalCode: sanitizeInput(businessPostalCode),
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
            businessType: mappedBusinessType,
            businessCategory: sanitizeInput(businessCategory),
            panNumber: sanitizeInput(panNumber.toUpperCase()),
            gstNumber: gstNumber ? sanitizeInput(gstNumber.toUpperCase()) : undefined,
            businessEmail: businessEmail ? sanitizeInput(businessEmail).toLowerCase() : undefined,
            businessPhone: businessPhone || undefined
          },
          addresses: vendorAddresses,
          upiId: sanitizeInput(upiId),
          products: [],
          categories: [],
          orders: [],
          documents: [],
          totalProducts: 0,
          activeProducts: 0,
          isApproved: false,
          isBusinessVerified: false,
          isGSTVerified: false,
          accountStatus: 'under_review',
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
          ...commonVerificationFields
        })
        message = "Vendor account created successfully! Please check your email for verification instructions and await approval."
        break

      case "admin":
        // No extra fields required for admin
        newUser = new Admin({
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          email: sanitizedEmail,
          password: hashedPassword,
          mobileNo: phoneNumber,
          role: 'admin',
          isActive: true,
          accountStatus: 'active',
          joiningDate: new Date(),
          totalActions: 0,
          totalLogins: 0,
          loginAttempts: 0,
          activityLogs: [],
          emergencyContacts: [],
          ...commonVerificationFields
        })
        message = "Admin account created successfully! Please check your email for verification instructions."
        break

      default:
        return NextResponse.json(
          { error: "Invalid role specified. Must be customer, vendor, or admin" },
          { status: 400, headers }
        )
    }

    await newUser.save()

    // Send verification email (controlled by environment variables)
    const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === 'true'
    const emailVerificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === 'true'
    
    let emailSent = false
    let emailProvider = 'none'
    
    if (emailVerificationEnabled) {
      try {
        const emailResult = await sendVerificationEmail(sanitizedEmail, verificationToken, verificationCode, role, sanitizedFirstName)
        emailSent = emailResult.success
        emailProvider = emailResult.provider
        console.log(`✅ Verification email ${emailProvider === 'sendgrid' ? 'sent via SendGrid' : 'logged to console'} for ${sanitizedEmail}`)
      } catch (emailError) {
        console.error("❌ Failed to send verification email:", emailError)
        
        // If email verification is required and sending fails, return error
        if (emailVerificationRequired) {
          return NextResponse.json(
            { error: "Registration failed: Unable to send verification email. Please try again later." },
            { status: 500, headers }
          )
        }
        // Otherwise, continue without failing the registration since email verification is optional
      }
    }

    // Remove password and sensitive fields from response
    const userResponse = newUser.toObject()
    delete userResponse.password
    delete userResponse.emailVerificationToken
    delete userResponse.emailVerificationCode

    // Create a clean response object
    const responseUser = {
      id: userResponse._id,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      email: userResponse.email,
      mobileNo: userResponse.mobileNo,
      role,
      isEmailVerified: userResponse.isEmailVerified,
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
        user: responseUser,
        verification: {
          emailEnabled: emailVerificationEnabled,
          emailRequired: emailVerificationRequired,
          emailSent: emailSent,
          emailProvider: emailProvider,
          mobileEnabled: process.env.MOBILE_VERIFICATION_ENABLED === 'true',
          mobileRequired: process.env.MOBILE_VERIFICATION_REQUIRED === 'true',
          instructions: emailSent 
            ? `Please check your email (${sanitizedEmail}) for verification instructions. ${emailVerificationRequired ? 'Email verification is required to access your account.' : 'Email verification is recommended for account security.'}`
            : emailVerificationEnabled 
              ? "Email verification is enabled but the verification email could not be sent. Please try requesting a new verification email."
              : "Email verification is currently disabled."
        }
      },
      { status: 201, headers }
    )

  } catch (error: unknown) {
    console.error("❌ Registration error:", error)
    
    // Add security headers to error responses
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')
    
    // Handle mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError" && 'errors' in error) {
      const validationErrors = Object.values(error.errors as Record<string, { message: string }>).map((err) => err.message)
      console.error("❌ Validation errors:", validationErrors)
      return NextResponse.json(
        { error: validationErrors.join(", ") },
        { status: 400, headers }
      )
    }

    // Handle duplicate key errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      console.error("❌ Duplicate key error:", error)
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409, headers }
      )
    }

    // Handle JSON parsing errors
    if (error && typeof error === 'object' && 'name' in error && error.name === "SyntaxError") {
      console.error("❌ JSON parsing error:", error)
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers }
      )
    }

    // Log the actual error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error("❌ Unhandled registration error:", errorMessage, error)

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500, headers }
    )
  }
}

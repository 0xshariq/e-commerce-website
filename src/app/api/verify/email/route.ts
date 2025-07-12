import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EmailService } from "@/lib/email-service"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

export async function POST(request: NextRequest) {
  try {
    const { action, email, code } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // Validate email service configuration before proceeding
    const emailConfig = EmailService.validateConfiguration()
    if (!emailConfig.isValid) {
      console.error(`Email configuration warning: ${emailConfig.message}`)
      // Continue anyway for database-backed OTP
    }

    switch (action) {
      case "send-otp":
        return await sendEmailOTP(email)
      
      case "verify-otp":
        return await verifyEmailOTP(request, email, code)
      
      case "cancel-verification":
        return await cancelEmailVerification(email)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message || "Unknown error",
      status: 500 
    })
  }
}

async function sendEmailOTP(email: string) {
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }
  if (!EmailService.isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
  }
  let firstName: string | undefined
  const session = await getServerSession(authOptions)
  if (session?.user?.name) {
    firstName = session.user.name.split(' ')[0]
  } else {
    try {
      await connectDB()
      const customer = await Customer.findOne({ email: email.toLowerCase() }).select('firstName')
      const vendor = await Vendor.findOne({ email: email.toLowerCase() }).select('firstName')
      const admin = await Admin.findOne({ email: email.toLowerCase() }).select('firstName')
      if (customer) firstName = customer.firstName
      else if (vendor) firstName = vendor.firstName
      else if (admin) firstName = admin.firstName
    } catch (error) {
      console.log('Error fetching user details:', error)
    }
  }
  // Generate and store OTP in DB, then send notification via SendGrid
  const result = await EmailService.sendOTP(email, firstName)
  if (result.success) {
    const response: any = {
      success: true,
      message: result.message,
      provider: result.provider
    }
    if (process.env.NODE_ENV === 'development' && result.otpCode) {
      response.otpCode = result.otpCode
    }
    return NextResponse.json(response)
  } else {
    return NextResponse.json({ error: result.message, details: result.error }, { status: 400 })
  }
}

async function verifyEmailOTP(request: NextRequest, email: string, code: string) {
  if (!email || !code) {
    return NextResponse.json({ 
      error: "Email and verification code are required" 
    }, { status: 400 })
  }

  // Verify OTP against our database
  const result = await EmailService.verifyOTP(email, code)

  if (!result.success) {
    return NextResponse.json({
      error: result.message,
      details: result.error
    }, { status: 400 })
  }

  // If user is logged in, update their email verification status
  const session = await getServerSession(authOptions) as { user: { id: string, role: string } } | null
  if (session) {
    try {
      await connectDB()
      
      let updateResult
      const lowerEmail = email.toLowerCase()

      switch (session.user.role) {
        case "customer":
          updateResult = await Customer.findByIdAndUpdate(
            session.user.id,
            { 
              email: lowerEmail,
              isEmailVerified: true,
              emailVerifiedAt: new Date(),
              emailVerificationToken: null,
              emailVerificationCode: null,
              emailVerificationExpiry: null
            },
            { new: true }
          )
          break
        
        case "vendor":
          updateResult = await Vendor.findByIdAndUpdate(
            session.user.id,
            { 
              email: lowerEmail,
              isEmailVerified: true,
              emailVerifiedAt: new Date(),
              emailVerificationToken: null,
              emailVerificationCode: null,
              emailVerificationExpiry: null
            },
            { new: true }
          )
          break
        
        case "admin":
          updateResult = await Admin.findByIdAndUpdate(
            session.user.id,
            { 
              email: lowerEmail,
              isEmailVerified: true,
              emailVerifiedAt: new Date(),
              emailVerificationToken: null,
              emailVerificationCode: null,
              emailVerificationExpiry: null
            },
            { new: true }
          )
          break
      }

      if (updateResult) {
        return NextResponse.json({
          success: true,
          message: "Email verified and updated successfully",
          emailVerified: true,
          role: session.user.role
        })
      }
    } catch (dbError) {
      console.error("Database update error:", dbError)
      // Still return success for verification, but note DB issue
      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        warning: "Profile update pending"
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: result.message
  })
}

async function cancelEmailVerification(email: string) {
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  // Clear any pending OTPs for this email from the database
  const result = await EmailService.cancelVerification(email)

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message
    })
  } else {
    return NextResponse.json({
      error: result.message,
      details: result.error
    }, { status: 400 })
  }
}

// Helper endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let user
    const userId = session.user.id
    const userRole = session.user.role
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 })
    }

    switch (userRole) {
      case "customer":
        user = await Customer.findById(userId).select("email isEmailVerified emailVerifiedAt")
        break
      case "vendor":
        user = await Vendor.findById(userId).select("email isEmailVerified emailVerifiedAt")
        break
      case "admin":
        user = await Admin.findById(userId).select("email isEmailVerified emailVerifiedAt")
        break
      default:
        return NextResponse.json({ error: "Invalid user role" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      email: user.email,
      emailVerified: user.isEmailVerified || false,
      emailVerifiedAt: user.emailVerifiedAt || null
    })
  } catch (error) {
    console.error("Email verification status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

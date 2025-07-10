import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TwilioService } from "@/lib/twilio"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber, otpCode, channel = 'sms' } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // Validate Twilio configuration before proceeding
    const twilioConfig = TwilioService.validateConfiguration();
    if (!twilioConfig.isValid) {
      console.error(`Twilio configuration error: ${twilioConfig.message}`);
      // Continue anyway for database-backed OTP
    }

    switch (action) {
      case "send-otp":
        return await sendOTP(phoneNumber, channel)
      
      case "verify-otp":
        return await verifyOTP(request, phoneNumber, otpCode)
      
      case "cancel-verification":
        return await cancelVerification(phoneNumber)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Mobile verification error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message || "Unknown error",
      status: 500 
    })
  }
}

async function sendOTP(phoneNumber: string, channel: 'sms' | 'whatsapp') {
  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }

  // Validate Indian phone number format
  if (!TwilioService.isValidIndianPhoneNumber(phoneNumber)) {
    return NextResponse.json({ 
      error: "Please enter a valid Indian mobile number" 
    }, { status: 400 })
  }

  // Always use SMS for now (whatsapp option is kept for future feature)
  const actualChannel = 'sms'
  const result = await TwilioService.sendOTP(phoneNumber, actualChannel)

  if (result.success) {
    // Return development mode OTP code if present
    const response: any = {
      success: true,
      message: result.message,
      channel: actualChannel
    }
    
    // In development mode, pass OTP back to frontend for easier testing
    if (process.env.NODE_ENV === 'development' && result.otpCode) {
      response.otpCode = result.otpCode
    }
    
    return NextResponse.json(response)
  } else {
    console.error('Failed to send OTP:', result.error)
    return NextResponse.json({
      error: result.message,
      details: result.error
    }, { status: 400 })
  }
}

async function verifyOTP(request: NextRequest, phoneNumber: string, otpCode: string) {
  if (!phoneNumber || !otpCode) {
    return NextResponse.json({ 
      error: "Phone number and OTP code are required" 
    }, { status: 400 })
  }

  // Verify OTP against our database
  const result = await TwilioService.verifyOTP(phoneNumber, otpCode)

  if (!result.success) {
    return NextResponse.json({
      error: result.message,
      details: result.error
    }, { status: 400 })
  }

  // If user is logged in, update their phone verification status
  const session = await getServerSession(authOptions) as { user: { id: string, role: string } } | null
  if (session) {
    try {
      await connectDB()
      
      const formattedNumber = TwilioService.formatPhoneNumber(phoneNumber)
      let updateResult

      switch (session.user.role) {
        case "customer":
          updateResult = await Customer.findByIdAndUpdate(
            session.user.id,
            { 
              phone: formattedNumber,
              phoneVerified: true,
              phoneVerifiedAt: new Date()
            },
            { new: true }
          )
          break
        
        case "vendor":
          updateResult = await Vendor.findByIdAndUpdate(
            session.user.id,
            { 
              "contactInfo.phone": formattedNumber,
              phoneVerified: true,
              phoneVerifiedAt: new Date()
            },
            { new: true }
          )
          break
        
        case "admin":
          updateResult = await Admin.findByIdAndUpdate(
            session.user.id,
            { 
              phone: formattedNumber,
              phoneVerified: true,
              phoneVerifiedAt: new Date()
            },
            { new: true }
          )
          break
      }

      if (updateResult) {
        return NextResponse.json({
          success: true,
          message: "Phone number verified and updated successfully",
          phoneVerified: true
        })
      }
    } catch (dbError) {
      console.error("Database update error:", dbError)
      // Still return success for verification, but note DB issue
      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully",
        warning: "Profile update pending"
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: result.message
  })
}

async function cancelVerification(phoneNumber: string) {
  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }

  // Clear any pending OTPs for this number from the database
  const result = await TwilioService.cancelVerification(phoneNumber)

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

    let user;
    const userId = session.user.id;
    const userRole = session.user.role;
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 })
    }

    switch (userRole) {
      case "customer":
        user = await Customer.findById(userId).select("phone phoneVerified phoneVerifiedAt")
        break
      case "vendor":
        user = await Vendor.findById(userId).select("contactInfo.phone phoneVerified phoneVerifiedAt")
        break
      case "admin":
        user = await Admin.findById(userId).select("phone phoneVerified phoneVerifiedAt")
        break
      default:
        return NextResponse.json({ error: "Invalid user role" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const phone = userRole === "vendor" ? user.contactInfo?.phone : user.phone

    return NextResponse.json({
      phoneNumber: phone,
      phoneVerified: user.phoneVerified || false,
      phoneVerifiedAt: user.phoneVerifiedAt || null
    })

  } catch (error) {
    console.error("Phone verification status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

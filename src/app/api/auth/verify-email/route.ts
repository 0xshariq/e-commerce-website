import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

export async function POST(request: NextRequest) {
  try {
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    const body = await request.json()
    const { token, code, email } = body

    // Validate input
    if (!token && !code) {
      return NextResponse.json(
        { error: "Verification token or code is required" },
        { status: 400, headers }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400, headers }
      )
    }

    await connectDB()

    // Find user in all collections
    let user = null
    let userModel = null
    let role = null

    // Check Customer collection
    user = await Customer.findOne({ email: email.toLowerCase() })
    if (user) {
      userModel = Customer
      role = 'customer'
    }

    // Check Vendor collection if not found
    if (!user) {
      user = await Vendor.findOne({ email: email.toLowerCase() })
      if (user) {
        userModel = Vendor
        role = 'vendor'
      }
    }

    // Check Admin collection if not found
    if (!user) {
      user = await Admin.findOne({ email: email.toLowerCase() })
      if (user) {
        userModel = Admin
        role = 'admin'
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers }
      )
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { 
          message: "Email is already verified",
          isVerified: true 
        },
        { status: 200, headers }
      )
    }

    // Verify using token or code
    let isValid = false

    if (token && user.emailVerificationToken) {
      isValid = token === user.emailVerificationToken
    } else if (code && user.emailVerificationCode) {
      isValid = code === user.emailVerificationCode
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification token or code" },
        { status: 400, headers }
      )
    }

    // Check if token/code has expired
    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400, headers }
      )
    }

    // Update user as verified
    if (!userModel) {
      return NextResponse.json(
        { error: "User model not found" },
        { status: 500, headers }
      )
    }

    await userModel.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationCode: null,
      emailVerificationExpiry: null
    })

    console.log(`Email verified successfully for ${role}: ${email}`)

    return NextResponse.json(
      {
        message: "Email verified successfully!",
        isVerified: true,
        role: role
      },
      { status: 200, headers }
    )

  } catch (error: unknown) {
    console.error("Email verification error:", error)
    
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    )
  }
}

// GET method for token-based verification (when user clicks email link)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=missing-token', request.url))
    }

    if (!email) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=missing-email', request.url))
    }

    await connectDB()

    // Find user in all collections
    let user = null
    let userModel = null
    let role = null

    // Check Customer collection
    user = await Customer.findOne({ email: email.toLowerCase() })
    if (user) {
      userModel = Customer
      role = 'customer'
    }

    // Check Vendor collection if not found
    if (!user) {
      user = await Vendor.findOne({ email: email.toLowerCase() })
      if (user) {
        userModel = Vendor
        role = 'vendor'
      }
    }

    // Check Admin collection if not found
    if (!user) {
      user = await Admin.findOne({ email: email.toLowerCase() })
      if (user) {
        userModel = Admin
        role = 'admin'
      }
    }

    if (!user) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=user-not-found', request.url))
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email?success=already-verified', request.url))
    }

    // Verify token
    if (token !== user.emailVerificationToken) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=invalid-token', request.url))
    }

    // Check if token has expired
    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=expired-token', request.url))
    }

    // Update user as verified
    if (!userModel) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=server-error', request.url))
    }

    await userModel.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationCode: null,
      emailVerificationExpiry: null
    })

    console.log(`Email verified successfully via link for ${role}: ${email}`)

    return NextResponse.redirect(new URL(`/auth/verify-email?success=verified&role=${role}`, request.url))

  } catch (error: unknown) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL('/auth/verify-email?error=server-error', request.url))
  }
}

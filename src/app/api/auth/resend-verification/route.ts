import { type NextRequest, NextResponse } from "next/server"
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
  
  const msg = {
    to: email,
    from: {
      email: fromEmail,
      name: companyName
    },
    subject: `${companyName} - Email Verification Code Resent`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Resent - ${companyName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${companyName}</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Email Verification Code Resent</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">Hello ${firstName}!</h2>
            
            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              You requested a new verification code for your ${role} account. Here's your fresh verification code:
            </p>
            
            <!-- Verification Code Box -->
            <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
              <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Your new verification code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 10px 0;">${verificationCode}</div>
              <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 12px;">This code expires in 24 hours</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: #ffffff; 
                        text-decoration: none; 
                        padding: 12px 25px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        font-size: 14px; 
                        display: inline-block;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                Verify Email Now
              </a>
            </div>
            
            <p style="color: #666666; line-height: 1.6; margin: 25px 0 15px 0; font-size: 14px;">
              Or copy and paste this link:<br>
              <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all; font-size: 13px;">${verificationUrl}</a>
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>🔒 Security:</strong> If you didn't request this verification code, please ignore this email or contact support.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${companyName}</p>
            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
              This is an automated message. Please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${firstName},
      
      You requested a new verification code for your ${role} account.
      
      Your verification code: ${verificationCode}
      
      Or visit: ${verificationUrl}
      
      This code expires in 24 hours.
      
      Best regards,
      The ${companyName} Team
    `
  }

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg)
      console.log(`✅ Verification email resent successfully to ${email}`)
      return { success: true, provider: 'sendgrid' }
    } else {
      // Fallback to console logging
      console.log(`
        📧 RESENT EMAIL VERIFICATION (SendGrid not configured)
        ======================================================
        To: ${email}
        Name: ${firstName}
        Role: ${role}
        Verification Code: ${verificationCode}
        Verification URL: ${verificationUrl}
        
        ⚠️  Configure SENDGRID_API_KEY in .env to enable actual email sending
      `)
      return { success: true, provider: 'console' }
    }
  } catch (error: unknown) {
    console.error('❌ SendGrid email error:', error)
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400, headers }
      )
    }

    const sanitizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers }
      )
    }

    await connectDB()

    // Find user in all collections
    let user = null
    let userModel = null
    let role = null

    // Check Customer collection
    user = await Customer.findOne({ email: sanitizedEmail })
    if (user) {
      userModel = Customer
      role = 'customer'
    }

    // Check Vendor collection if not found
    if (!user) {
      user = await Vendor.findOne({ email: sanitizedEmail })
      if (user) {
        userModel = Vendor
        role = 'vendor'
      }
    }

    // Check Admin collection if not found
    if (!user) {
      user = await Admin.findOne({ email: sanitizedEmail })
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

    if (!userModel) {
      return NextResponse.json(
        { error: "User model not found" },
        { status: 500, headers }
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

    // Generate new verification tokens
    const verificationToken = generateVerificationToken()
    const verificationCode = generateVerificationCode()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new verification tokens
    await userModel.findByIdAndUpdate(user._id, {
      emailVerificationToken: verificationToken,
      emailVerificationCode: verificationCode,
      emailVerificationExpiry: verificationTokenExpiry
    })

    // Send verification email
    try {
      await sendVerificationEmail(sanitizedEmail, verificationToken, verificationCode, role || 'user', user.firstName || 'User')
      console.log(`Verification email resent successfully to ${sanitizedEmail}`)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500, headers }
      )
    }

    return NextResponse.json(
      {
        message: "Verification email sent successfully! Please check your inbox.",
        emailSent: true
      },
      { status: 200, headers }
    )

  } catch (error: unknown) {
    console.error("Resend verification error:", error)
    
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

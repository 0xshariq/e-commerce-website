import sgMail from "@sendgrid/mail"
import { connectDB } from "./database"
import mongoose from "mongoose"
import { renderToString } from "react-dom/server"
import React from "react"

// Import role-specific email templates
import CustomerVerificationEmail from "@/templates/email/customer-verification-email"
import VendorOTPVerification from "@/templates/email/vendor-verification-email"
import AdminVerificationEmail from "@/templates/email/admin-verification-email"

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Define email verification OTP Schema
const EmailOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true, lowercase: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], required: true },
  purpose: { type: String, enum: ['registration', 'login', 'password-reset', 'profile-update'], default: 'registration' },
  createdAt: { type: Date, default: Date.now }
})

// Create Email OTP model if it doesn't exist yet
let EmailOTP: mongoose.Model<any>
try {
  EmailOTP = mongoose.model("EmailOTP")
} catch (error) {
  EmailOTP = mongoose.model("EmailOTP", EmailOTPSchema)
}

export interface EmailVerificationResult {
  success: boolean
  message: string
  status?: string
  error?: string
  otpCode?: string // For development/testing environments
  provider?: string // Which provider was used to send the email
}

export type UserRole = 'customer' | 'vendor' | 'admin';
export type EmailPurpose = 'registration' | 'login' | 'password-reset' | 'profile-update';

export interface EmailOTPData {
  email: string;
  firstName?: string;
  role: UserRole;
  purpose?: EmailPurpose;
}

export class EmailService {
  /**
   * Validate email configuration
   * @returns Object indicating if configuration is valid and error message if not
   */
  static validateConfiguration() {
    const companyName = process.env.COMPANY_NAME
    const fromEmail = process.env.FROM_EMAIL
    const sendgridKey = process.env.SENDGRID_API_KEY
    
    if (!companyName || !fromEmail) {
      return {
        isValid: false,
        message: "Missing company name or sender email address"
      }
    }
    
    if (!sendgridKey) {
      return {
        isValid: false,
        message: "SendGrid API key is missing"
      }
    }
    
    return { isValid: true, message: "Email configuration is valid" }
  }

  /**
   * Generate role-specific email content
   */
  private static generateEmailContent(data: EmailOTPData & { otpCode: string; expiresAt: Date }): { html: string; subject: string } {
    const { email, firstName, role, otpCode, expiresAt, purpose = 'registration' } = data;
    const companyName = process.env.COMPANY_NAME || "E-Commerce Platform";
    const expiryTime = expiresAt.toLocaleString();

    let html: string;
    let subject: string;

    switch (role) {
      case 'customer':
        html = renderToString(
          React.createElement(CustomerVerificationEmail, {
            customerName: firstName || 'Customer',
            verificationCode: otpCode,
            purpose,
            expiryTime,
          })
        );
        subject = `${companyName} - Customer Account Verification`;
        break;

      case 'vendor':
        html = renderToString(
          React.createElement(VendorOTPVerification, {
            vendorName: firstName || 'Vendor',
            verificationCode: otpCode,
            purpose,
            expiryTime,
          })
        );
        subject = `${companyName} - Vendor Account Verification`;
        break;

      case 'admin':
        html = renderToString(
          React.createElement(AdminVerificationEmail, {
            adminName: firstName || 'Administrator',
            verificationCode: otpCode,
            expiryTime,
          })
        );
        subject = `${companyName} - Admin Access Verification`;
        break;

      default:
        throw new Error(`Unsupported user role: ${role}`);
    }

    return { html, subject };
  }
  
  /**
   * Send an OTP code via email for verification based on user role
   */
  static async sendOTP(data: EmailOTPData): Promise<EmailVerificationResult> {
    try {
      const { email, firstName, role, purpose = 'registration' } = data;

      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Set expiration time (24 hours)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      // Connect to database and save OTP
      await connectDB()
      
      // Clear any previous OTPs for this email
      await EmailOTP.deleteMany({ email: email.toLowerCase() })
      
      // Save new OTP to database
      await EmailOTP.create({
        email: email.toLowerCase(),
        otpCode,
        expiresAt,
        role,
        purpose,
        verified: false
      })
      
      // Get configuration
      const companyName = process.env.COMPANY_NAME || "E-Commerce Platform"
      const fromEmail = process.env.FROM_EMAIL || "no-reply@ecommerce.com"
      
      // Generate role-specific email content
      const { html, subject } = this.generateEmailContent({
        email,
        firstName,
        role,
        purpose,
        otpCode,
        expiresAt
      });
      
      // Send email using SendGrid if configured
      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to: email,
          from: {
            email: fromEmail,
            name: companyName
          },
          subject,
          html,
          text: `Your verification code for ${companyName} (${role}) is: ${otpCode}. This code will expire in 24 hours.`
        }
        
        await sgMail.send(msg)
        
        console.log(`✅ ${role} verification email sent successfully to ${email}`)
      } else {
        // Log to console in development mode
        console.log(`
          📧 EMAIL VERIFICATION (SendGrid not configured)
          ===============================================
          To: ${email}
          Role: ${role}
          Purpose: ${purpose}
          Name: ${firstName || 'User'}
          Verification Code: ${otpCode}
          Expires: ${expiresAt}
          
          ⚠️  Configure SENDGRID_API_KEY in .env to enable actual email sending
        `)
      }
      
      // For development/testing environments, include the OTP in the response
      const isDev = process.env.NODE_ENV === "development"
      
      return {
        success: true,
        message: `OTP sent successfully to ${email}`,
        status: "pending",
        provider: process.env.SENDGRID_API_KEY ? "sendgrid" : "console",
        ...(isDev && { otpCode }) // Only include OTP in development mode
      }
    } catch (error: any) {
      console.error("Email OTP generation error:", error)
      return {
        success: false,
        message: "Failed to generate email OTP",
        error: error.message
      }
    }
  }
  
  /**
   * Verify an email OTP code
   */
  static async verifyOTP(email: string, otpCode: string, role?: UserRole): Promise<EmailVerificationResult> {
    try {
      // Connect to database
      await connectDB()
      
      // Build query - include role if provided for additional security
      const query: any = {
        email: email.toLowerCase(),
        otpCode: otpCode,
        expiresAt: { $gt: new Date() }, // Not expired yet
        verified: false
      };

      if (role) {
        query.role = role;
      }
      
      // Find the OTP record
      const otpRecord = await EmailOTP.findOne(query);
      
      if (!otpRecord) {
        return {
          success: false,
          message: "Invalid or expired OTP code",
          status: "rejected"
        }
      }
      
      // Mark OTP as verified
      otpRecord.verified = true
      await otpRecord.save()
      
      // Delete other OTPs for this email to keep the database clean
      await EmailOTP.deleteMany({
        email: email.toLowerCase(),
        _id: { $ne: otpRecord._id }
      })
      
      return {
        success: true,
        message: "Email verified successfully",
        status: "approved"
      }
    } catch (error: any) {
      console.error("Email OTP verification error:", error)
      return {
        success: false,
        message: "Failed to verify email OTP",
        error: error.message
      }
    }
  }
  
  /**
   * Cancel pending email verifications
   */
  static async cancelVerification(email: string, role?: UserRole): Promise<EmailVerificationResult> {
    try {
      // Connect to database
      await connectDB()
      
      // Build query - include role if provided
      const query: any = { email: email.toLowerCase() };
      if (role) {
        query.role = role;
      }
      
      // Delete all OTP records for this email
      const result = await EmailOTP.deleteMany(query);
      
      return {
        success: true,
        message: `Email verification cancelled successfully. ${result.deletedCount} OTP records removed.`
      }
    } catch (error: any) {
      console.error("Cancel email verification error:", error)
      return {
        success: false,
        message: "Failed to cancel email verification",
        error: error.message
      }
    }
  }
  
  /**
   * Check if email is valid format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Send role-specific notification emails
   */
  static async sendNotification(data: {
    to: string;
    role: UserRole;
    type: 'welcome' | 'order-confirmation' | 'password-reset' | 'account-security';
    templateData: Record<string, any>;
  }): Promise<EmailVerificationResult> {
    try {
      const { to, role, type, templateData } = data;
      const companyName = process.env.COMPANY_NAME || "E-Commerce Platform";
      const fromEmail = process.env.FROM_EMAIL || "no-reply@ecommerce.com";

      let subject: string;
      let html: string;

      // Generate content based on notification type and role
      switch (type) {
        case 'welcome':
          subject = `Welcome to ${companyName}!`;
          html = `<h1>Welcome ${templateData.name}!</h1><p>Your ${role} account has been successfully created.</p>`;
          break;
        case 'order-confirmation':
          subject = `Order Confirmation - #${templateData.orderId}`;
          html = `<h1>Order Confirmed!</h1><p>Thank you for your order #${templateData.orderId}.</p>`;
          break;
        case 'password-reset':
          subject = `Password Reset Request`;
          html = `<h1>Password Reset</h1><p>Click the link to reset your password: ${templateData.resetLink}</p>`;
          break;
        case 'account-security':
          subject = `Security Alert`;
          html = `<h1>Security Alert</h1><p>${templateData.message}</p>`;
          break;
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }

      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to,
          from: {
            email: fromEmail,
            name: companyName
          },
          subject,
          html,
        };

        await sgMail.send(msg);
        console.log(`✅ ${type} notification sent to ${to} (${role})`);
      } else {
        console.log(`📧 ${type.toUpperCase()} NOTIFICATION (${role}): ${subject} -> ${to}`);
      }

      return {
        success: true,
        message: `${type} notification sent successfully`,
        provider: process.env.SENDGRID_API_KEY ? "sendgrid" : "console"
      };

    } catch (error: any) {
      console.error("Email notification error:", error);
      return {
        success: false,
        message: "Failed to send email notification",
        error: error.message
      };
    }
  }
}

export default EmailService

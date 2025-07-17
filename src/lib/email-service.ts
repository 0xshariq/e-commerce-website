import sgMail from "@sendgrid/mail"
import { connectDB } from "./database"
import { Customer } from "../models/customer"
import { Vendor } from "../models/vendor" 
import { Admin } from "../models/admin"
import { render } from "@react-email/render"
import React from "react"

// Import role-specific email templates
import CustomerVerificationEmail from "../../templates/email/customer-verification-email"
import VendorVerificationEmail from "../../templates/email/vendor-verification-email"
import AdminVerificationEmail from "../../templates/email/admin-verification-email"

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
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
  private static async generateEmailContent(data: EmailOTPData & { otpCode: string; expiresAt: Date }): Promise<{ html: string; subject: string }> {
    const { email, firstName, role, otpCode, expiresAt, purpose = 'registration' } = data;
    const companyName = process.env.COMPANY_NAME || "E-Commerce Platform";
    const expiryTime = expiresAt.toLocaleString();

    let html: string;
    let subject: string;

    switch (role) {
      case 'customer':
        html = await render(
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
        html = await render(
          React.createElement(VendorVerificationEmail, {
            vendorName: firstName || 'Vendor',
            verificationCode: otpCode,
            purpose,
            expiryTime,
          })
        );
        subject = `${companyName} - Vendor Account Verification`;
        break;

      case 'admin':
        html = await render(
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
   * Send OTP by fetching existing verification code from user's database record
   */
  static async sendOTP(email: string, userRole: UserRole, userId?: string): Promise<EmailVerificationResult> {
    try {
      const normalizedEmail = email.toLowerCase();
      
      // Connect to database and fetch user's verification code
      await connectDB();
      
      let user: any = null;
      let otpCode: string | null = null;
      let userName = 'User';
      
      // Find user and get their verification code
      if (userId) {
        // If userId provided, fetch directly by ID
        switch (userRole) {
          case 'customer':
            user = await Customer.findById(userId).select('firstName emailVerificationCode emailVerificationExpiry');
            break;
          case 'vendor':
            user = await Vendor.findById(userId).select('firstName emailVerificationCode emailVerificationExpiry');
            break;
          case 'admin':
            user = await Admin.findById(userId).select('firstName emailVerificationCode emailVerificationExpiry');
            break;
        }
      } else {
        // Find user by email
        const customer = await Customer.findOne({ email: normalizedEmail }).select('firstName emailVerificationCode emailVerificationExpiry');
        const vendor = await Vendor.findOne({ email: normalizedEmail }).select('firstName emailVerificationCode emailVerificationExpiry');
        const admin = await Admin.findOne({ email: normalizedEmail }).select('firstName emailVerificationCode emailVerificationExpiry');
        
        if (customer) {
          user = customer;
          userRole = 'customer';
        } else if (vendor) {
          user = vendor;
          userRole = 'vendor';
        } else if (admin) {
          user = admin;
          userRole = 'admin';
        }
      }
      
      if (!user) {
        return {
          success: false,
          message: 'User not found. Please register first.',
          error: 'User not found'
        };
      }
      
      // Check if verification code exists and is not expired
      if (user.emailVerificationCode && user.emailVerificationExpiry && user.emailVerificationExpiry > new Date()) {
        otpCode = user.emailVerificationCode;
        userName = user.firstName || 'User';
      } else {
        return {
          success: false,
          message: 'No valid verification code found. Please generate a new verification code from your profile.',
          error: 'No valid verification code'
        };
      }
      
      // Get configuration
      const companyName = process.env.COMPANY_NAME!;
      const fromEmail = process.env.FROM_EMAIL!;
      
      // Generate role-specific email content
      const { html, subject } = await this.generateEmailContent({
        email: normalizedEmail,
        firstName: userName,
        role: userRole,
        purpose: 'registration',
        otpCode: otpCode, // otpCode is guaranteed to be string here
        expiresAt: user.emailVerificationExpiry
      });

      // Send email using SendGrid if configured
      let emailSent = false;
      if (process.env.SENDGRID_API_KEY) {
        try {
          const msg = {
            to: normalizedEmail,
            from: {
              email: fromEmail,
              name: companyName
            },
            subject,
            html,
            text: `Your verification code for ${companyName} (${userRole}) is: ${otpCode}. This code will expire soon.`
          };

          await sgMail.send(msg);
          emailSent = true;
          console.log(`✅ ${userRole} verification email sent successfully to ${normalizedEmail}`);
        } catch (emailError: any) {
          console.error('SendGrid email error:', emailError);
        }
      } else {
        // Log to console in development mode
        console.log(`
          📧 EMAIL VERIFICATION (SendGrid not configured)
          ===============================================
          To: ${normalizedEmail}
          Role: ${userRole}
          Name: ${userName}
          Verification Code: ${otpCode}
          Expires: ${user.emailVerificationExpiry}
          
          ⚠️  Configure SENDGRID_API_KEY in .env to enable actual email sending
        `);
      }

      // For development/testing environments, include the OTP in the response
      const isDev = process.env.NODE_ENV === "development";

      return {
        success: true,
        message: emailSent ? `Verification code sent to ${normalizedEmail}` : `Verification code found in database`,
        status: "pending",
        provider: process.env.SENDGRID_API_KEY ? "sendgrid" : "console",
        ...(isDev && { otpCode: otpCode })
      };
      
    } catch (error: any) {
      console.error("Email verification fetch error:", error);
      return {
        success: false,
        message: "Failed to fetch verification code",
        error: error.message
      };
    }
  }

  /**
   * Verify email OTP code using user's database record
   */
  static async verifyOTP(email: string, otpCode: string, userRole?: UserRole, userId?: string): Promise<EmailVerificationResult> {
    try {
      const normalizedEmail = email.toLowerCase();
      
      // Connect to database
      await connectDB();

      let user: any = null;
      let actualRole: UserRole = userRole || 'customer';
      
      // Find user and verify their verification code
      if (userId) {
        // If userId provided, fetch directly by ID
        switch (userRole) {
          case 'customer':
            user = await Customer.findById(userId).select('email emailVerificationCode emailVerificationExpiry emailVerified');
            break;
          case 'vendor':
            user = await Vendor.findById(userId).select('email emailVerificationCode emailVerificationExpiry emailVerified');
            break;
          case 'admin':
            user = await Admin.findById(userId).select('email emailVerificationCode emailVerificationExpiry emailVerified');
            break;
        }
      } else {
        // Find user by email across all user types
        const customer = await Customer.findOne({ email: normalizedEmail }).select('email emailVerificationCode emailVerificationExpiry emailVerified');
        const vendor = await Vendor.findOne({ email: normalizedEmail }).select('email emailVerificationCode emailVerificationExpiry emailVerified');
        const admin = await Admin.findOne({ email: normalizedEmail }).select('email emailVerificationCode emailVerificationExpiry emailVerified');
        
        if (customer) {
          user = customer;
          actualRole = 'customer';
        } else if (vendor) {
          user = vendor;
          actualRole = 'vendor';
        } else if (admin) {
          user = admin;
          actualRole = 'admin';
        }
      }
      
      if (!user) {
        return {
          success: false,
          message: "User not found. Please register first.",
          status: "rejected",
          error: 'User not found'
        };
      }
      
      // Check if email is already verified
      if (user.emailVerified) {
        return {
          success: true,
          message: "Email is already verified",
          status: "approved"
        };
      }
      
      // Verify the verification code
      if (!user.emailVerificationCode || user.emailVerificationCode !== otpCode) {
        return {
          success: false,
          message: "Invalid verification code",
          status: "rejected"
        };
      }
      
      // Check if verification code has expired
      if (!user.emailVerificationExpiry || user.emailVerificationExpiry <= new Date()) {
        return {
          success: false,
          message: "Verification code has expired. Please generate a new one.",
          status: "rejected"
        };
      }
      
      // Mark email as verified and clear verification code
      user.emailVerified = true;
      user.emailVerificationCode = null;
      user.emailVerificationExpiry = null;
      await user.save();

      console.log(`✅ Email verification successful for ${actualRole}: ${normalizedEmail}`);

      return {
        success: true,
        message: "Email verified successfully",
        status: "approved"
      };
      
    } catch (error: any) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Failed to verify email",
        status: "rejected",
        error: error.message
      };
    }
  }

  /**
   * Cancel pending email verifications by clearing user's verification codes
   */
  static async cancelVerification(email: string, userRole?: UserRole, userId?: string): Promise<EmailVerificationResult> {
    try {
      const normalizedEmail = email.toLowerCase();
      
      // Connect to database
      await connectDB();

      let user: any = null;
      let actualRole: UserRole = userRole || 'customer';
      let clearedCount = 0;
      
      // Find user and clear their verification code
      if (userId) {
        // If userId provided, fetch directly by ID
        switch (userRole) {
          case 'customer':
            user = await Customer.findById(userId);
            break;
          case 'vendor':
            user = await Vendor.findById(userId);
            break;
          case 'admin':
            user = await Admin.findById(userId);
            break;
        }
      } else {
        // Find user by email across all user types
        const customer = await Customer.findOne({ email: normalizedEmail });
        const vendor = await Vendor.findOne({ email: normalizedEmail });
        const admin = await Admin.findOne({ email: normalizedEmail });
        
        if (customer) {
          user = customer;
          actualRole = 'customer';
        } else if (vendor) {
          user = vendor;
          actualRole = 'vendor';
        } else if (admin) {
          user = admin;
          actualRole = 'admin';
        }
      }
      
      if (!user) {
        return {
          success: false,
          message: "User not found",
          error: 'User not found'
        };
      }
      
      // Clear verification codes if they exist
      if (user.emailVerificationCode || user.emailVerificationExpiry) {
        user.emailVerificationCode = null;
        user.emailVerificationExpiry = null;
        await user.save();
        clearedCount = 1;
      }

      console.log(`✅ Email verification cancelled for ${actualRole}: ${normalizedEmail}`);

      return {
        success: true,
        message: `Email verification cancelled successfully for ${actualRole}. ${clearedCount} verification code cleared.`
      };
      
    } catch (error: any) {
      console.error("Cancel email verification error:", error);
      return {
        success: false,
        message: "Failed to cancel email verification",
        error: error.message
      };
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

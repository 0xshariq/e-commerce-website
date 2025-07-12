import twilio from 'twilio';
import { connectDB } from './database';
import mongoose from 'mongoose';
import { generateCustomerOTPSMS, type CustomerOTPSMSData } from '../../templates/sms/customer-sms-template';
import { generateVendorOTPSMS, type VendorOTPSMSData } from '../../templates/sms/vendor-sms-templates';
import { generateAdminOTPSMS, type AdminOTPSMSData } from '../../templates/sms/admin-sms-templates';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
const senderNumber = process.env.TWILIO_PHONE_NUMBER // Fallback if messaging service is not available

if(!accountSid || !authToken || !messagingServiceSid) {
  throw new Error("Twilio credentials are not set. Please check your environment variables.");
}
if(!senderNumber){
  throw new Error("Twilio sender number is not set. Please check your environment variables.");
}
// Define OTP Schema with role support
const OTPSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, index: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], required: true },
  purpose: { type: String, enum: ['registration', 'login', 'password-reset', 'profile-update'], default: 'registration' },
  createdAt: { type: Date, default: Date.now }
});

// Create OTP model if it doesn't exist yet
let OTP: mongoose.Model<any>;
try {
  OTP = mongoose.model('OTP');
} catch (error) {
  OTP = mongoose.model('OTP', OTPSchema);
}

// Initialize Twilio client only if credentials are provided
let client: any = null;
try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } else {
    console.warn('Twilio credentials missing. SMS functionality will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
  // Continue without Twilio client
}

export interface VerificationResult {
  success: boolean
  message: string
  status?: string
  error?: string
  otpCode?: string // For development/testing environments
}

export type UserRole = 'customer' | 'vendor' | 'admin';
export type SMSPurpose = 'registration' | 'login' | 'password-reset' | 'profile-update';

export interface SMSOTPData {
  phoneNumber: string;
  firstName?: string;
  role: UserRole;
  purpose?: SMSPurpose;
  channel?: 'sms' | 'whatsapp';
}

export class TwilioService {
  /**
   * Validate Twilio configuration
   * @returns Object indicating if configuration is valid and error message if not
   */
  
  
  /**
   * Generate and store OTP in DB, then send notification via Twilio (if configured)
   */
  static async sendOTP(phoneNumber: string, channel: 'sms' | 'whatsapp' = 'sms', firstName?: string): Promise<VerificationResult> {
    try {
      // Format phone number to E.164 format
      const formattedNumber = this.formatPhoneNumber(phoneNumber)
      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      // Set expiration time (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      // Connect to database and save OTP
      await connectDB()
      // Clear any previous OTPs for this phone number
      await OTP.deleteMany({ phoneNumber: formattedNumber })
      // Save new OTP to database
      await OTP.create({
        phoneNumber: formattedNumber,
        otpCode,
        expiresAt,
        verified: false
      })
      // Send notification via Twilio (if configured)
      let notificationSent = false
      if (client) {
        try {
          // Import SMS template from templates directory
          const messageBody = getOtpVerificationTemplate({
            code: otpCode,
            firstName,
            expiryMinutes: 10
          })
          const messageOptions: any = {
            body: messageBody,
            to: formattedNumber
          }
          if (messagingServiceSid) {
            messageOptions.messagingServiceSid = messagingServiceSid
          } else if (senderNumber) {
            messageOptions.from = senderNumber
          }
          await client.messages.create(messageOptions)
          notificationSent = true
        } catch (twilioError: any) {
          console.error('Twilio notification error:', twilioError)
        }
      }
      // For development/testing environments, include the OTP in the response
      const isDev = process.env.NODE_ENV === 'development'
      return {
        success: true,
        message: notificationSent ? `OTP sent via SMS` : `OTP generated and stored in DB`,
        status: 'pending',
        ...(isDev && { otpCode })
      }
    } catch (error: any) {
      console.error('OTP generation error:', error)
      return {
        success: false,
        message: 'Failed to generate OTP',
        error: error.message
      }
    }
  }

  // Method to send an SMS with a pre-generated OTP code
  // Useful for testing or in cases where the OTP is already generated
  static async sendPreGeneratedOTP(phoneNumber: string, otpCode: string): Promise<VerificationResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber)
      
      if (!client) {
        return {
          success: false,
          message: 'Twilio client not initialized',
          error: 'Missing Twilio credentials'
        }
      }
      
      const message = await client.messages.create({
        body: `Your verification code for ShopHub is ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`,
        from: senderNumber,
        to: formattedNumber
      })

      return {
        success: true,
        message: 'OTP sent successfully via SMS',
        status: message.status
      }
    } catch (error: any) {
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        message: 'Failed to send SMS',
        error: error.message
      }
    }
  }

  static async sendCustomMessage(phoneNumber: string, message: string): Promise<VerificationResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber)
      
      const smsMessage = await client.messages.create({
        body: message,
        from: senderNumber,
        to: formattedNumber
      })

      return {
        success: true,
        message: 'Message sent successfully',
        status: smsMessage.status
      }
    } catch (error: any) {
      console.error('Twilio custom message error:', error)
      return {
        success: false,
        message: 'Failed to send message',
        error: error.message
      }
    }
  }

  static async verifyOTP(phoneNumber: string, otpCode: string): Promise<VerificationResult> {
    try {
      // Format phone number to E.164 format
      const formattedNumber = this.formatPhoneNumber(phoneNumber)
      
      // Connect to database
      await connectDB()
      
      // Find the OTP record
      const otpRecord = await OTP.findOne({ 
        phoneNumber: formattedNumber,
        otpCode: otpCode,
        expiresAt: { $gt: new Date() }, // Not expired yet
        verified: false
      })
      
      if (!otpRecord) {
        return {
          success: false,
          message: 'Invalid or expired OTP code',
          status: 'rejected'
        }
      }
      
      // Mark OTP as verified
      otpRecord.verified = true
      await otpRecord.save()
      
      // Delete other OTPs for this phone number to keep the database clean
      await OTP.deleteMany({
        phoneNumber: formattedNumber,
        _id: { $ne: otpRecord._id }
      })
      
      return {
        success: true,
        message: 'Phone number verified successfully',
        status: 'approved'
      }
    } catch (error: any) {
      console.error('OTP verification error:', error)
      return {
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      }
    }
  }

  static async cancelVerification(phoneNumber: string): Promise<VerificationResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber)
      
      // Connect to database
      await connectDB()
      
      // Delete all OTP records for this phone number
      const result = await OTP.deleteMany({ phoneNumber: formattedNumber })
      
      return {
        success: true,
        message: `Verification cancelled successfully. ${result.deletedCount} OTP records removed.`
      }
    } catch (error: any) {
      console.error('Cancel verification error:', error)
      return {
        success: false,
        message: 'Failed to cancel verification',
        error: error.message
      }
    }
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Handle Indian phone numbers
    if (cleaned.length === 10) {
      return `+91${cleaned}`
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`
    } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
      return `+${cleaned.substring(0, 12)}`
    }
    
    // For other countries, assume it's already in correct format
    return phoneNumber.startsWith('+') ? phoneNumber : `+${cleaned}`
  }

  static isValidIndianPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Check if it's a valid 10-digit Indian mobile number
    if (cleaned.length === 10) {
      return /^[6-9]\d{9}$/.test(cleaned)
    }
    
    // Check if it's a valid Indian number with country code
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      const mobile = cleaned.substring(2)
      return /^[6-9]\d{9}$/.test(mobile)
    }
    
    return false
  }

  // New method to get sender number for display purposes
  static getSenderNumber(): string {
    return senderNumber
  }

  /**
   * Validate Twilio configuration
   * @returns Object indicating if configuration is valid and error message if not
   */
  static validateConfiguration(): { isValid: boolean; message: string } {
    if (!accountSid || !authToken) {
      return {
        isValid: false,
        message: "Twilio credentials are missing"
      };
    }
    
    if (!messagingServiceSid && !senderNumber) {
      return {
        isValid: false,
        message: "Both messaging service SID and sender phone number are missing"
      };
    }
    
    if (!client) {
      return {
        isValid: false,
        message: "Twilio client initialization failed"
      };
    }
    
    return { isValid: true, message: "Twilio configuration is valid" };
  }
}

export default TwilioService

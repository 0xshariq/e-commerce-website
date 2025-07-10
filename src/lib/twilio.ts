import twilio from 'twilio';
import { connectDB } from './database';
import mongoose from 'mongoose';

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const senderNumber = process.env.TWILIO_PHONE_NUMBER || "+917208179779" // Use env var or fallback

// Define OTP Schema
const OTPSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, index: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
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
if (accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
    // Continue without Twilio client
  }
}

export interface VerificationResult {
  success: boolean
  message: string
  status?: string
  error?: string
  otpCode?: string // For development/testing environments
}

export class TwilioService {
  static async sendOTP(phoneNumber: string, channel: 'sms' | 'whatsapp' = 'sms'): Promise<VerificationResult> {
    try {
      // Format phone number to E.164 format if it's an Indian number
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
      
      // Send OTP via SMS using Twilio
      if (client) {
        try {
          const message = await client.messages.create({
            body: `Your verification code for ShopHub is ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`,
            from: senderNumber,
            to: formattedNumber
          })
          
          console.log(`SMS sent to ${formattedNumber}, SID: ${message.sid}, Status: ${message.status}`);
        } catch (twilioError: any) {
          console.error('Failed to send via Twilio:', twilioError)
          if (twilioError.code) {
            console.error(`Twilio Error Code: ${twilioError.code}`)
          }
          // Continue even if Twilio fails - we have the OTP in the database
        }
      } else {
        console.warn('Twilio client not initialized. Cannot send actual SMS.')
      }
      
      console.log(`OTP generated for ${formattedNumber}: ${otpCode}`);
      
      // For development/testing environments, include the OTP in the response
      // This should be removed in production
      const isDev = process.env.NODE_ENV === 'development'
      
      return {
        success: true,
        message: `OTP sent successfully via ${channel}`,
        status: 'pending',
        ...(isDev && { otpCode }) // Only include OTP in development mode
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

  // Method to validate Twilio configuration
  static validateConfiguration(): { isValid: boolean; message: string } {
    if (!accountSid || !authToken) {
      return {
        isValid: false,
        message: 'Missing Twilio Account SID or Auth Token'
      }
    }

    if (!senderNumber) {
      return {
        isValid: false,
        message: 'Missing Twilio sender phone number'
      }
    }

    if (!client) {
      return {
        isValid: false,
        message: 'Twilio client not initialized'
      }
    }

    return {
      isValid: true,
      message: 'Twilio SMS configured and ready'
    }
  }
}

export default TwilioService

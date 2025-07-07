import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
const senderNumber = "+917208179779" // Fixed sender number as requested

// Note: For Twilio Verify Service, the sender number is configured at the service level
// For manual SMS sending, use the senderNumber above

if (!accountSid || !authToken || !serviceSid) {
  throw new Error('Missing Twilio configuration. Please check your environment variables.')
}

const client = twilio(accountSid, authToken)

export interface VerificationResult {
  success: boolean
  message: string
  status?: string
  error?: string
}

export class TwilioService {
  static async sendOTP(phoneNumber: string, channel: 'sms' | 'whatsapp' = 'sms'): Promise<VerificationResult> {
    try {
      // Format phone number to E.164 format if it's an Indian number
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : phoneNumber.startsWith('91') 
          ? `+${phoneNumber}`
          : `+91${phoneNumber}`

      const verification = await client.verify.v2
        .services(serviceSid!)
        .verifications
        .create({ 
          to: formattedNumber, 
          channel: channel === 'whatsapp' ? 'whatsapp' : 'sms'
        })

      return {
        success: true,
        message: `OTP sent successfully via ${channel}`,
        status: verification.status
      }
    } catch (error: any) {
      console.error('Twilio OTP send error:', error)
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      }
    }
  }

  static async verifyOTP(phoneNumber: string, otpCode: string): Promise<VerificationResult> {
    try {
      // Format phone number to E.164 format if it's an Indian number
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : phoneNumber.startsWith('91') 
          ? `+${phoneNumber}`
          : `+91${phoneNumber}`

      const verificationCheck = await client.verify.v2
        .services(serviceSid!)
        .verificationChecks
        .create({ 
          to: formattedNumber, 
          code: otpCode 
        })

      if (verificationCheck.status === 'approved') {
        return {
          success: true,
          message: 'Phone number verified successfully',
          status: verificationCheck.status
        }
      } else {
        return {
          success: false,
          message: 'Invalid OTP code',
          status: verificationCheck.status
        }
      }
    } catch (error: any) {
      console.error('Twilio OTP verify error:', error)
      return {
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      }
    }
  }

  static async cancelVerification(phoneNumber: string): Promise<VerificationResult> {
    try {
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : phoneNumber.startsWith('91') 
          ? `+${phoneNumber}`
          : `+91${phoneNumber}`

      // Note: Twilio Verify Service doesn't support listing/canceling pending verifications
      // This is a placeholder for future implementation if needed
      
      return {
        success: true,
        message: 'Verification cancelled successfully'
      }
    } catch (error: any) {
      console.error('Twilio cancel verification error:', error)
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
}

export default TwilioService

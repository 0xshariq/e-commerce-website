import twilio from 'twilio';
import { connectDB } from './database';
import { Customer } from '../models/customer';
import { Vendor } from '../models/vendor';
import { Admin } from '../models/admin';
import { generateCustomerOTPSMS } from '../../templates/sms/customer-sms-template';
import { generateVendorOTPSMS } from '../../templates/sms/vendor-sms-templates';
import { generateAdminOTPSMS } from '../../templates/sms/admin-sms-templates';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID!;
const senderNumber = process.env.TWILIO_PHONE_NUMBER!; 

if(!accountSid || !authToken || !messagingServiceSid) {
  console.warn("Twilio credentials are not set. SMS functionality will be limited.");
}
if(!senderNumber){
  console.warn("Twilio sender number is not set. SMS functionality will be limited.");
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
   * Send OTP by fetching existing verification code from user's database record
   */
  static async sendOTP(phoneNumber: string, userRole: UserRole, userId?: string): Promise<VerificationResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
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
            user = await Customer.findById(userId).select('firstName mobileVerificationCode mobileVerificationExpiry');
            break;
          case 'vendor':
            user = await Vendor.findById(userId).select('firstName mobileVerificationCode mobileVerificationExpiry');
            break;
          case 'admin':
            user = await Admin.findById(userId).select('firstName mobileVerificationCode mobileVerificationExpiry');
            break;
        }
      } else {
        // Find user by phone number
        const customer = await Customer.findOne({ mobileNo: formattedNumber }).select('firstName mobileVerificationCode mobileVerificationExpiry');
        const vendor = await Vendor.findOne({ mobileNo: formattedNumber }).select('firstName mobileVerificationCode mobileVerificationExpiry');
        const admin = await Admin.findOne({ mobileNo: formattedNumber }).select('firstName mobileVerificationCode mobileVerificationExpiry');
        
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
      if (user.mobileVerificationCode && user.mobileVerificationExpiry && user.mobileVerificationExpiry > new Date()) {
        otpCode = user.mobileVerificationCode;
        userName = user.firstName || 'User';
      } else {
        return {
          success: false,
          message: 'No valid verification code found. Please generate a new verification code from your profile.',
          error: 'No valid verification code'
        };
      }
      
      // Send SMS if Twilio is configured
      let smsSent = false;
      if (client && otpCode) {
        try {
          // Generate role-specific SMS message
          let messageBody: string;
          const expiryMinutes = Math.ceil((user.mobileVerificationExpiry.getTime() - Date.now()) / (1000 * 60));
          
          switch (userRole) {
            case 'customer':
              messageBody = generateCustomerOTPSMS({
                customerName: userName,
                otp: otpCode, // otpCode is guaranteed to be string here
                expiryMinutes: Math.max(expiryMinutes, 1)
              });
              break;
            case 'vendor':
              messageBody = generateVendorOTPSMS({
                vendorName: userName,
                otp: otpCode, // otpCode is guaranteed to be string here
                expiryMinutes: Math.max(expiryMinutes, 1)
              });
              break;
            case 'admin':
              messageBody = generateAdminOTPSMS({
                adminName: userName,
                otp: otpCode, // otpCode is guaranteed to be string here
                expiryMinutes: Math.max(expiryMinutes, 1)
              });
              break;
            default:
              messageBody = `Hello ${userName}! Your verification code is: ${otpCode}. This code expires in ${Math.max(expiryMinutes, 1)} minutes. Do not share this code with anyone.`;
          }
          
          const messageOptions: any = {
            body: messageBody,
            to: formattedNumber
          };
          
          if (messagingServiceSid) {
            messageOptions.messagingServiceSid = messagingServiceSid;
          } else if (senderNumber) {
            messageOptions.from = senderNumber;
          }
          
          await client.messages.create(messageOptions);
          smsSent = true;
        } catch (twilioError: any) {
          console.error('Twilio SMS error:', twilioError);
        }
      }
      
      // For development/testing environments, include the OTP in the response
      const isDev = process.env.NODE_ENV === 'development';
      
      return {
        success: true,
        message: smsSent ? `Verification code sent via SMS to ${formattedNumber}` : `Verification code found in database`,
        status: 'pending',
        ...(isDev && { otpCode })
      };
      
    } catch (error: any) {
      console.error('OTP fetch error:', error);
      return {
        success: false,
        message: 'Failed to fetch verification code',
        error: error.message
      };
    }
  }

  /**
   * Verify OTP by checking against user's database record
   */
  static async verifyOTP(phoneNumber: string, otpCode: string, userRole?: UserRole): Promise<VerificationResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Connect to database
      await connectDB();
      
      let user: any = null;
      let foundRole: UserRole = 'customer';
      
      if (userRole) {
        // Check specific role
        switch (userRole) {
          case 'customer':
            user = await Customer.findOne({ mobileNo: formattedNumber }).select('mobileVerificationCode mobileVerificationExpiry isMobileVerified');
            foundRole = 'customer';
            break;
          case 'vendor':
            user = await Vendor.findOne({ mobileNo: formattedNumber }).select('mobileVerificationCode mobileVerificationExpiry isMobileVerified');
            foundRole = 'vendor';
            break;
          case 'admin':
            user = await Admin.findOne({ mobileNo: formattedNumber }).select('mobileVerificationCode mobileVerificationExpiry isMobileVerified');
            foundRole = 'admin';
            break;
        }
      } else {
        // Check all roles
        const customer = await Customer.findOne({ mobileNo: formattedNumber }).select('mobileVerificationCode mobileVerificationExpiry isMobileVerified');
        const vendor = await Vendor.findOne({ mobileNo: formattedNumber }).select('mobileVerificationCode mobileVerificationExpiry isMobileVerified');
        const admin = await Admin.findOne({ mobileNo: formattedNumber }).select('mobileVerificationCode mobileVerificationExpiry isMobileVerified');
        
        if (customer) {
          user = customer;
          foundRole = 'customer';
        } else if (vendor) {
          user = vendor;
          foundRole = 'vendor';
        } else if (admin) {
          user = admin;
          foundRole = 'admin';
        }
      }
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          status: 'rejected'
        };
      }
      
      // Check if code matches and is not expired
      if (!user.mobileVerificationCode || user.mobileVerificationCode !== otpCode) {
        return {
          success: false,
          message: 'Invalid verification code',
          status: 'rejected'
        };
      }
      
      if (!user.mobileVerificationExpiry || user.mobileVerificationExpiry <= new Date()) {
        return {
          success: false,
          message: 'Verification code has expired',
          status: 'rejected'
        };
      }
      
      // Mark as verified and clear verification fields
      const updateData = {
        isMobileVerified: true,
        mobileVerificationCode: null,
        mobileVerificationExpiry: null
      };
      
      switch (foundRole) {
        case 'customer':
          await Customer.findByIdAndUpdate(user._id, updateData);
          break;
        case 'vendor':
          await Vendor.findByIdAndUpdate(user._id, updateData);
          break;
        case 'admin':
          await Admin.findByIdAndUpdate(user._id, updateData);
          break;
      }
      
      return {
        success: true,
        message: 'Phone number verified successfully',
        status: 'approved'
      };
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify code',
        error: error.message
      };
    }
  }

  /**
   * Cancel verification by clearing codes from user record
   */
  static async cancelVerification(phoneNumber: string): Promise<VerificationResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Connect to database
      await connectDB();
      
      let updatedCount = 0;
      
      // Clear verification codes from all user types
      const clearData = {
        mobileVerificationCode: null,
        mobileVerificationExpiry: null
      };
      
      const customerResult = await Customer.updateMany({ mobileNo: formattedNumber }, clearData);
      const vendorResult = await Vendor.updateMany({ mobileNo: formattedNumber }, clearData);
      const adminResult = await Admin.updateMany({ mobileNo: formattedNumber }, clearData);
      
      updatedCount = customerResult.modifiedCount + vendorResult.modifiedCount + adminResult.modifiedCount;
      
      return {
        success: true,
        message: `Verification cancelled successfully. ${updatedCount} record(s) updated.`
      };
      
    } catch (error: any) {
      console.error('Cancel verification error:', error);
      return {
        success: false,
        message: 'Failed to cancel verification',
        error: error.message
      };
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
    return senderNumber || '';
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

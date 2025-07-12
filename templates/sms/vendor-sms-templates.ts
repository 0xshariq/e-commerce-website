// Vendor OTP and SMS Templates

export interface VendorOTPSMSData {
  vendorName: string;
  otp: string;
  expiryMinutes: number;
  purpose: 'registration' | 'login' | 'password-reset' | 'profile-update';
}

export interface VendorSMSData {
  vendorName: string;
  businessName?: string;
}

export function generateVendorOTPSMS(data: VendorOTPSMSData): string {
  const { vendorName, otp, expiryMinutes, purpose } = data;
  
  const purposeTexts = {
    registration: 'complete your vendor registration',
    login: 'log into your vendor account',
    'password-reset': 'reset your vendor password',
    'profile-update': 'update your vendor profile'
  };

  const purposeText = purposeTexts[purpose] || 'verify your vendor account';

  return `Hello ${vendorName}! Your OTP to ${purposeText} is: ${otp}. This code expires in ${expiryMinutes} minutes. Keep it secure. - E-Commerce Vendor Portal`;
}

export function generateVendorWelcomeSMS(data: VendorSMSData): string {
  const { vendorName, businessName } = data;
  const businessText = businessName ? ` for ${businessName}` : '';
  
  return `Welcome to our Vendor Portal, ${vendorName}! Your vendor account${businessText} has been successfully created. Start selling and grow your business with us!`;
}

export function generateVendorApplicationApprovedSMS(data: VendorSMSData): string {
  const { vendorName, businessName } = data;
  const businessText = businessName ? ` for ${businessName}` : '';
  
  return `Great news ${vendorName}! Your vendor application${businessText} has been approved. You can now start listing your products and selling on our platform.`;
}

export function generateVendorApplicationRejectedSMS(data: VendorSMSData & { reason?: string }): string {
  const { vendorName, businessName, reason } = data;
  const businessText = businessName ? ` for ${businessName}` : '';
  const reasonText = reason ? ` Reason: ${reason}` : '';
  
  return `Hi ${vendorName}, unfortunately your vendor application${businessText} was not approved.${reasonText} Please contact support for more information.`;
}

export function generateVendorOrderNotificationSMS(vendorName: string, orderId: string, amount: number, customerName: string): string {
  return `New order alert! ${vendorName}, you have received order #${orderId} for ₹${amount} from ${customerName}. Login to your vendor dashboard to process it.`;
}

export function generateVendorPaymentReleasedSMS(vendorName: string, amount: number, orderId: string): string {
  return `Payment released! ${vendorName}, ₹${amount} for order #${orderId} has been transferred to your account. Check your vendor dashboard for details.`;
}

export function generateVendorLowStockAlertSMS(vendorName: string, productName: string, currentStock: number): string {
  return `Stock alert! ${vendorName}, your product "${productName}" is running low with only ${currentStock} units left. Please restock soon to avoid stockouts.`;
}

export function generateVendorAccountSuspendedSMS(vendorName: string, reason?: string): string {
  const reasonText = reason ? ` Reason: ${reason}` : '';
  return `Account Alert: ${vendorName}, your vendor account has been temporarily suspended.${reasonText} Contact support immediately to resolve this issue.`;
}

export function generateVendorPerformanceReportSMS(vendorName: string, period: string, sales: number, orders: number): string {
  return `Performance Report: ${vendorName}, your ${period} summary - ₹${sales} in sales from ${orders} orders. Keep up the great work! Check dashboard for details.`;
}

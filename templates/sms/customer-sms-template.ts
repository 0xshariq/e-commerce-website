// Customer OTP Verification SMS Templates

export interface CustomerOTPSMSData {
  customerName: string;
  otp: string;
  expiryMinutes: number;
}

export function generateCustomerOTPSMS(data: CustomerOTPSMSData): string {
  const { customerName, otp, expiryMinutes } = data;
  
  return `Hello ${customerName}! Your verification code is: ${otp}. This code expires in ${expiryMinutes} minutes. Do not share this code with anyone. - E-Commerce Platform`;
}

export function generateCustomerWelcomeSMS(customerName: string): string {
  return `Welcome to our E-Commerce Platform, ${customerName}! Your account has been successfully created. Start shopping now and enjoy exclusive deals! For support, visit our help center.`;
}

export function generateCustomerOrderConfirmationSMS(customerName: string, orderId: string, amount: number): string {
  return `Hi ${customerName}! Your order #${orderId} for ₹${amount} has been confirmed. We'll notify you once it's shipped. Track your order in the app. Thank you for shopping with us!`;
}

export function generateCustomerOrderShippedSMS(customerName: string, orderId: string, trackingNumber?: string): string {
  const trackingText = trackingNumber ? ` Tracking: ${trackingNumber}` : '';
  return `Good news ${customerName}! Your order #${orderId} has been shipped and is on its way.${trackingText} Expected delivery in 3-5 business days.`;
}

export function generateCustomerOrderDeliveredSMS(customerName: string, orderId: string): string {
  return `Hi ${customerName}! Your order #${orderId} has been delivered successfully. Please rate your experience and leave a review. Happy shopping!`;
}

export function generateCustomerPasswordResetSMS(customerName: string, resetLink: string): string {
  return `Hi ${customerName}! Reset your password using this secure link: ${resetLink}. This link expires in 30 minutes. If you didn't request this, please ignore.`;
}

export function generateCustomerAccountSecurityAlertSMS(customerName: string, activity: string): string {
  return `Security Alert: ${customerName}, we detected ${activity} on your account. If this wasn't you, please secure your account immediately. Contact support if needed.`;
}

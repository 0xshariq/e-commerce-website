import crypto from "crypto"

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input.toString().trim().replace(/[<>]/g, '')
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }
  
  return { isValid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate mobile number format
 */
export function validateMobileNumber(mobileNo: string): boolean {
  const mobileRegex = /^\+?[1-9]\d{9,14}$/
  return mobileRegex.test(mobileNo)
}

/**
 * Validate PAN number format
 */
export function validatePAN(panNumber: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(panNumber.toUpperCase())
}

/**
 * Validate GST number format
 */
export function validateGST(gstNumber: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gstNumber.toUpperCase())
}

/**
 * Validate UPI ID format
 */
export function validateUPI(upiId: string): boolean {
  const upiRegex = /^[\w.-]+@[\w.-]+$/
  return upiRegex.test(upiId)
}

/**
 * Validate postal code format (6 digits)
 */
export function validatePostalCode(postalCode: string): boolean {
  const postalRegex = /^\d{6}$/
  return postalRegex.test(postalCode)
}

/**
 * Generate secure headers for API responses
 */
export function getSecureHeaders(): Headers {
  const headers = new Headers()
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  return headers
}

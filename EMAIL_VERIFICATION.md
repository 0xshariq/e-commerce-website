# Email Verification System

## Overview
This system provides comprehensive email verification functionality for all user roles (customer, vendor, admin) with optional/required verification modes and professional email templates.

## Features

### ✅ Implemented
- **SendGrid Integration**: Professional email templates with HTML and text versions
- **Environment-based Configuration**: Control verification settings via environment variables
- **Multi-role Support**: Different email templates for customers, vendors, and admins
- **Fallback Mechanism**: Console logging when SendGrid is not configured
- **Security**: 24-hour token expiration, secure token generation
- **Responsive UI**: Clean verification pages with error handling
- **Resend Functionality**: Users can request new verification emails

### 🔧 Configuration

#### Environment Variables
```env
# Email Service (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="no-reply@yourcompany.com"
COMPANY_NAME="YourCompany"
SUPPORT_EMAIL="support@yourcompany.com"

# Verification Settings
EMAIL_VERIFICATION_ENABLED=true     # Enable/disable email verification
EMAIL_VERIFICATION_REQUIRED=false   # Make verification optional/required
MOBILE_VERIFICATION_ENABLED=true    # Enable mobile verification (future)
MOBILE_VERIFICATION_REQUIRED=false  # Make mobile verification optional/required
```

#### Database Fields (All User Models)
```typescript
// Added to Customer, Vendor, and Admin models
isEmailVerified: boolean
emailVerificationToken?: string
emailVerificationCode?: string
emailVerificationExpiry?: Date
isMobileVerified: boolean
mobileVerificationCode?: string
mobileVerificationExpiry?: Date
```

## API Endpoints

### 1. Registration with Email Verification
**POST** `/api/auth/register`

Automatically sends verification email during registration.

**Response includes:**
```json
{
  "message": "Account created successfully!",
  "user": { ... },
  "verification": {
    "emailEnabled": true,
    "emailRequired": false,
    "emailSent": true,
    "emailProvider": "sendgrid",
    "instructions": "Check your email for verification..."
  }
}
```

### 2. Email Verification
**POST** `/api/auth/verify-email`
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**GET** `/api/auth/verify-email?token=xxx&email=xxx`
- Direct link verification from email

### 3. Resend Verification Email
**POST** `/api/auth/resend-verification`
```json
{
  "email": "user@example.com"
}
```

## User Interface

### Pages
- `/auth/verify-email` - Email verification page with code input and resend functionality
- Enhanced `/auth/signup` - Shows verification status after registration

### Features
- **Code Input**: 6-digit verification code entry
- **Link Verification**: Click-to-verify from email
- **Resend Functionality**: Request new verification email
- **Error Handling**: Clear error messages and recovery options
- **Role-based Redirects**: Automatic redirect to appropriate dashboard after verification

## Email Templates

### Professional Design Features
- **Responsive Design**: Works on desktop and mobile
- **Brand Consistency**: Uses company name and colors
- **Security Notices**: Clear expiration and security information
- **Multiple CTAs**: Both verification code and direct link options
- **Role-specific Content**: Different benefits and messaging per user type

### Template Variations
- **Welcome Email**: Full onboarding template for new registrations
- **Resend Email**: Simplified template for code resend requests
- **Fallback Text**: Plain text versions for all emails

## Security Features

### Token Security
- **Crypto-secure Generation**: Uses Node.js crypto module
- **24-hour Expiration**: Tokens automatically expire
- **One-time Use**: Tokens are cleared after successful verification
- **Unique Tokens**: Both token and code systems for flexibility

### Validation
- **Email Format**: Strict email validation
- **Input Sanitization**: XSS protection
- **Rate Limiting**: Built-in error handling prevents spam
- **Secure Headers**: Security headers on all responses

## Development vs Production

### Development Mode (SendGrid not configured)
- Verification emails logged to console
- All functionality works except actual email delivery
- Clear console output for testing

### Production Mode (SendGrid configured)
- Professional emails sent via SendGrid
- Error handling and fallback mechanisms
- Monitoring and logging

## Usage Examples

### Making Email Verification Required
```env
EMAIL_VERIFICATION_REQUIRED=true
```
- Users must verify email before account access
- Registration fails if email cannot be sent
- Sign-in can be restricted for unverified users

### Making Email Verification Optional
```env
EMAIL_VERIFICATION_REQUIRED=false
```
- Users can use account without verification
- Verification email sent but not enforced
- Recommended for better security

### Disabling Email Verification
```env
EMAIL_VERIFICATION_ENABLED=false
```
- No verification emails sent
- Users can immediately access accounts
- Useful for development or specific use cases

## Future Enhancements

### Mobile Verification
- SMS verification using Twilio
- Similar token-based system
- Environment-controlled like email verification

### Email Service Alternatives
- Support for other email providers
- SMTP configuration options
- Multiple provider fallbacks

### Advanced Features
- Email templates customization
- Verification attempt limits
- Admin override capabilities
- Bulk verification management

## Troubleshooting

### Common Issues
1. **SendGrid API Key**: Ensure valid API key with email sending permissions
2. **From Email**: Use verified sender in SendGrid
3. **Environment Variables**: Check all required env vars are set
4. **Database**: Ensure verification fields exist in all user models

### Monitoring
- Check console logs for email sending status
- Monitor SendGrid dashboard for delivery status
- Track verification completion rates

## Security Considerations

### Best Practices
- Use HTTPS in production
- Secure environment variables
- Regular token cleanup
- Monitor for suspicious activity
- Rate limit verification requests

This email verification system provides a solid foundation for secure user registration and can be easily configured for different environments and requirements.

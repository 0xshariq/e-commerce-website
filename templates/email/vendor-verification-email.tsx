import React from 'react';

interface VendorOTPVerificationProps {
  vendorName: string;
  verificationCode: string;
  purpose: 'registration' | 'login' | 'password-reset' | 'profile-update';
  expiryTime: string;
}

export default function VendorOTPVerification({
  vendorName,
  verificationCode,
  purpose,
  expiryTime,
}: VendorOTPVerificationProps) {
  const purposeTexts = {
    registration: 'complete your vendor registration',
    login: 'log into your vendor account',
    'password-reset': 'reset your vendor password',
    'profile-update': 'update your vendor profile'
  };

  const purposeText = purposeTexts[purpose] || 'verify your vendor account';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vendor Account Verification</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#28a745', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
              🏪 Vendor Portal
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Business Account Verification
            </p>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#212529', marginTop: '0', fontSize: '24px' }}>
              Hello {vendorName}!
            </h2>
            
            <p style={{ color: '#495057', fontSize: '16px', marginBottom: '25px' }}>
              We received a request to {purposeText}. Please use the verification code below to continue with your vendor account access.
            </p>

            {/* Verification Code Box */}
            <div style={{ 
              backgroundColor: '#d4edda', 
              border: '2px solid #28a745', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center', 
              marginBottom: '25px' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#155724', fontSize: '18px' }}>
                Vendor Verification Code
              </h3>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#28a745', 
                letterSpacing: '8px', 
                fontFamily: 'monospace',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #28a745'
              }}>
                {verificationCode}
              </div>
            </div>

            {/* Vendor Benefits */}
            <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '6px', padding: '15px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>
                📈 Vendor Benefits:
              </h4>
              <ul style={{ margin: '0', padding: '0 0 0 20px', color: '#6c757d' }}>
                <li>Manage your product catalog</li>
                <li>Track sales and analytics</li>
                <li>Process orders efficiently</li>
                <li>Access to vendor dashboard</li>
                <li>Customer communication tools</li>
              </ul>
            </div>

            {/* Security Information */}
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px', padding: '15px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '16px' }}>
                🔒 Security Notice
              </h4>
              <ul style={{ margin: '0', padding: '0 0 0 20px', color: '#856404' }}>
                <li>This code expires at {expiryTime}</li>
                <li>Only use this code on the vendor portal</li>
                <li>Keep your vendor credentials secure</li>
                <li>Contact support if this wasn't you</li>
              </ul>
            </div>

            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '0' }}>
              If you need assistance with your vendor account, please contact our vendor support team.
            </p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', borderTop: '1px solid #dee2e6' }}>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
              This is an automated message for vendor account verification.
              <br />
              Success in your business! 🚀
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

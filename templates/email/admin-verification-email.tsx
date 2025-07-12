import React from 'react';

interface AdminVerificationEmailProps {
  adminName: string;
  verificationCode: string;
  expiryTime: string;
}

export default function AdminVerificationEmail({
  adminName,
  verificationCode,
  expiryTime,
}: AdminVerificationEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Email Verification</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#dc3545', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
              🛡️ Admin Portal
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Administrative Access Verification
            </p>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#212529', marginTop: '0', fontSize: '24px' }}>
              Hello {adminName}!
            </h2>
            
            <p style={{ color: '#495057', fontSize: '16px', marginBottom: '25px' }}>
              You have requested admin access verification. Please use the verification code below to complete your login process.
            </p>

            {/* Verification Code Box */}
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '2px solid #ffc107', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center', 
              marginBottom: '25px' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '18px' }}>
                Admin Verification Code
              </h3>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#dc3545', 
                letterSpacing: '8px', 
                fontFamily: 'monospace',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #ffc107'
              }}>
                {verificationCode}
              </div>
            </div>

            {/* Security Information */}
            <div style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px', padding: '15px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#721c24', fontSize: '16px' }}>
                🔒 Security Notice
              </h4>
              <ul style={{ margin: '0', padding: '0 0 0 20px', color: '#721c24' }}>
                <li>This code expires at {expiryTime}</li>
                <li>Never share this code with anyone</li>
                <li>Only use this code on official admin login pages</li>
                <li>If you didn't request this code, contact IT security immediately</li>
              </ul>
            </div>

            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '0' }}>
              If you're having trouble accessing your admin account, please contact the system administrator or IT support team.
            </p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', borderTop: '1px solid #dee2e6' }}>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
              This is an automated message for admin account verification.
              <br />
              For security purposes, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

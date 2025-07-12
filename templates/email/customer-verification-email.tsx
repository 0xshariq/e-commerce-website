import React from 'react';

interface CustomerVerificationEmailProps {
  customerName: string;
  verificationCode: string;
  purpose: 'registration' | 'login' | 'password-reset' | 'profile-update';
  expiryTime: string;
}

export default function CustomerVerificationEmail({
  customerName,
  verificationCode,
  purpose,
  expiryTime,
}: CustomerVerificationEmailProps) {
  const purposeTexts = {
    registration: 'complete your registration',
    login: 'log into your account',
    'password-reset': 'reset your password',
    'profile-update': 'update your profile'
  };

  const purposeText = purposeTexts[purpose] || 'verify your account';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Customer Email Verification</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#007bff', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
              🛒 E-Commerce Platform
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Customer Account Verification
            </p>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#212529', marginTop: '0', fontSize: '24px' }}>
              Hello {customerName}!
            </h2>
            
            <p style={{ color: '#495057', fontSize: '16px', marginBottom: '25px' }}>
              We received a request to {purposeText}. Please use the verification code below to proceed.
            </p>

            {/* Verification Code Box */}
            <div style={{ 
              backgroundColor: '#e7f3ff', 
              border: '2px solid #007bff', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center', 
              marginBottom: '25px' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0056b3', fontSize: '18px' }}>
                Your Verification Code
              </h3>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#007bff', 
                letterSpacing: '8px', 
                fontFamily: 'monospace',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #007bff'
              }}>
                {verificationCode}
              </div>
            </div>

            {/* Features */}
            <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '6px', padding: '15px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '16px' }}>
                🎯 What you can do:
              </h4>
              <ul style={{ margin: '0', padding: '0 0 0 20px', color: '#6c757d' }}>
                <li>Browse thousands of products</li>
                <li>Add items to your wishlist</li>
                <li>Track your orders in real-time</li>
                <li>Enjoy exclusive customer deals</li>
              </ul>
            </div>

            {/* Security Information */}
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px', padding: '15px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '16px' }}>
                🔒 Security Information
              </h4>
              <ul style={{ margin: '0', padding: '0 0 0 20px', color: '#856404' }}>
                <li>This code expires at {expiryTime}</li>
                <li>Only use this code on our official website</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>

            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '0' }}>
              If you're having trouble with your account, please contact our customer support team.
            </p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', borderTop: '1px solid #dee2e6' }}>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
              This is an automated message for account verification.
              <br />
              Happy shopping! 🛍️
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
            <Text style={helpText}>If you didn't create an account with us, you can safely ignore this email.</Text>
            <Text style={helpText}>
              Having trouble? Contact our support team at {" "}
              <a href="mailto:support@shophub.com" style={link}>
                support@shophub.com
              </a>
            </Text>
          </Section>
        </Section>
        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>© {new Date().getFullYear()} ShopHub. All rights reserved.</Text>
          <Text style={footerText}>Our mailing address: 123 AI Street, Tech City, TC 12345</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

// Styles
const main = {
  backgroundColor: "#f5f7fa",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "20px",
}
const container = {
  margin: "0 auto",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}
const header = {
  padding: "24px",
  textAlign: "center" as const,
}
const logo = {
  margin: "0 auto",
}
const content = {
  padding: "0 32px",
}
const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "32px 0 24px",
}
const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}
const instructionText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  textAlign: "center" as const,
}
const otpContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
}
const otpLabel = {
  color: "#4b5563",
  fontSize: "14px",
  marginBottom: "8px",
}
const otpCode = {
  color: "#111827",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
}
const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}
const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  cursor: "pointer",
}
const expirationText = {
  color: "#6b7280",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "16px 0 32px",
}
const divider = {
  borderColor: "#e5e7eb",
  margin: "0",
}
const helpSection = {
  padding: "24px 0",
}
const helpText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
}
const link = {
  color: "#4f46e5",
  textDecoration: "none",
}
const footer = {
  backgroundColor: "#f9fafb",
  padding: "24px 32px",
  textAlign: "center" as const,
}
const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0",
}

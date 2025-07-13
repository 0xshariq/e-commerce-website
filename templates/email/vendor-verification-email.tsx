import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';

interface VendorVerificationEmailProps {
  vendorName: string;
  verificationCode: string;
  purpose: 'registration' | 'login' | 'password-reset' | 'profile-update';
  expiryTime: string;
}

export default function VendorVerificationEmail({
  vendorName,
  verificationCode,
  purpose,
  expiryTime,
}: VendorVerificationEmailProps) {
  const purposeTexts = {
    registration: 'complete your vendor registration',
    login: 'log into your vendor account',
    'password-reset': 'reset your vendor password',
    'profile-update': 'update your vendor profile'
  };

  const purposeText = purposeTexts[purpose] || 'verify your vendor account';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              🏪 Vendor Portal
            </Heading>
            <Text style={subtitle}>
              Business Account Verification
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h2}>
              Hello {vendorName}!
            </Heading>
            
            <Text style={text}>
              We received a request to {purposeText}. Please use the verification code below to proceed.
            </Text>

            {/* Verification Code Box */}
            <Section style={otpContainer}>
              <Text style={otpLabel}>
                Your Verification Code
              </Text>
              <Text style={otpCode}>
                {verificationCode}
              </Text>
            </Section>

            {/* Vendor Features */}
            <Section style={featureBox}>
              <Text style={featureTitle}>
                🚀 Vendor Benefits:
              </Text>
              <Text style={featureText}>
                • List and manage your products<br />
                • Track sales and revenue<br />
                • Manage customer orders<br />
                • Access vendor analytics<br />
                • Handle refunds and support
              </Text>
            </Section>

            {/* Security Information */}
            <Section style={securityBox}>
              <Text style={securityTitle}>
                🔒 Security Information
              </Text>
              <Text style={securityText}>
                • This code expires at {expiryTime}<br />
                • Only use this code on our official vendor portal<br />
                • Never share this code with anyone<br />
                • If you didn't request this, please ignore this email
              </Text>
            </Section>

            <Text style={helpText}>
              If you need assistance with your vendor account, please contact our business support team.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message for vendor account verification.
              <br />
              Happy selling! 💼
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f5f7fa",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const header = {
  padding: "24px",
  textAlign: "center" as const,
  backgroundColor: "#f8f9fa",
};

const h1 = {
  color: "#28a745",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const subtitle = {
  color: "#6c757d",
  fontSize: "14px",
  margin: "5px 0 0 0",
};

const content = {
  padding: "32px",
};

const h2 = {
  color: "#212529",
  fontSize: "24px",
  fontWeight: "600",
  marginTop: "0",
};

const text = {
  color: "#495057",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0 24px 0",
};

const otpContainer = {
  backgroundColor: "#d4edda",
  border: "2px solid #28a745",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const otpLabel = {
  color: "#155724",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const otpCode = {
  color: "#28a745",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  fontFamily: "monospace",
  backgroundColor: "white",
  padding: "15px",
  borderRadius: "6px",
  border: "1px solid #28a745",
  margin: "0",
};

const featureBox = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  padding: "16px",
  margin: "20px 0",
};

const featureTitle = {
  color: "#495057",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const featureText = {
  color: "#6c757d",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const securityBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "6px",
  padding: "16px",
  margin: "20px 0",
};

const securityTitle = {
  color: "#856404",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const securityText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const helpText = {
  color: "#6c757d",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0 0 0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  backgroundColor: "#f9fafb",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6c757d",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};
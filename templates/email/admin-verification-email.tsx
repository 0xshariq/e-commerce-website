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
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              🛡️ Admin Portal
            </Heading>
            <Text style={subtitle}>
              Administrative Access Verification
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h2}>
              Hello {adminName}!
            </Heading>
            
            <Text style={text}>
              You have requested admin access verification. Please use the verification code below to complete your login process.
            </Text>

            {/* Verification Code Box */}
            <Section style={otpContainer}>
              <Text style={otpLabel}>
                Admin Verification Code
              </Text>
              <Text style={otpCode}>
                {verificationCode}
              </Text>
            </Section>

            {/* Admin Features */}
            <Section style={featureBox}>
              <Text style={featureTitle}>
                ⚡ Admin Privileges:
              </Text>
              <Text style={featureText}>
                • Full system access and control<br />
                • User and vendor management<br />
                • Platform analytics and reports<br />
                • Security and audit controls<br />
                • System configuration management
              </Text>
            </Section>

            {/* Security Warning */}
            <Section style={securityBox}>
              <Text style={securityTitle}>
                ⚠️ Security Notice
              </Text>
              <Text style={securityText}>
                • This code expires at {expiryTime}<br />
                • Admin access requires highest security<br />
                • Never share this code with anyone<br />
                • Report suspicious activity immediately<br />
                • Use secure networks only
              </Text>
            </Section>

            <Text style={helpText}>
              If you did not request admin access, please contact the system administrator immediately.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is a security-critical administrative verification.
              <br />
              System Access Control 🔐
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
  color: "#dc3545",
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
  backgroundColor: "#fff3cd",
  border: "2px solid #ffc107",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const otpLabel = {
  color: "#856404",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const otpCode = {
  color: "#dc3545",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  fontFamily: "monospace",
  backgroundColor: "white",
  padding: "15px",
  borderRadius: "6px",
  border: "1px solid #dc3545",
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
  backgroundColor: "#f8d7da",
  border: "1px solid #f5c6cb",
  borderRadius: "6px",
  padding: "16px",
  margin: "20px 0",
};

const securityTitle = {
  color: "#721c24",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const securityText = {
  color: "#721c24",
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
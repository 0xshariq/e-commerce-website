import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Scale, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
          </div>
          <p className="text-gray-600">
            Last updated: December 2024
          </p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Agreement Overview
              </CardTitle>
              <CardDescription>
                By using our e-commerce platform, you agree to these terms and conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Welcome to our e-commerce platform. These Terms and Conditions ("Terms") govern your use of our website 
                and services. By accessing or using our platform, you agree to be bound by these Terms. If you do not 
                agree with any part of these Terms, you may not use our services.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>1. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Registration</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You must be at least 18 years old to create an account</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Customer</Badge>
                    <p className="text-sm text-gray-600">Browse and purchase products from various vendors</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Vendor</Badge>
                    <p className="text-sm text-gray-600">Sell products and manage your online store</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge variant="secondary" className="mb-2">Admin</Badge>
                    <p className="text-sm text-gray-600">Platform administration and management</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Usage */}
          <Card>
            <CardHeader>
              <CardTitle>2. Platform Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Acceptable Use</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Use the platform only for lawful purposes</li>
                  <li>Respect intellectual property rights</li>
                  <li>Do not engage in fraudulent activities</li>
                  <li>Do not upload malicious content or viruses</li>
                  <li>Do not spam or harass other users</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Prohibited Activities</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium mb-2">The following activities are strictly prohibited:</p>
                      <ul className="list-disc pl-6 space-y-1 text-red-700 text-sm">
                        <li>Selling counterfeit or illegal products</li>
                        <li>Manipulating product reviews or ratings</li>
                        <li>Creating fake accounts or impersonating others</li>
                        <li>Attempting to hack or compromise platform security</li>
                        <li>Violating any applicable laws or regulations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions and Payments */}
          <Card>
            <CardHeader>
              <CardTitle>3. Transactions and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Processing</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>All payments are processed through secure payment gateways</li>
                  <li>Prices are displayed in Indian Rupees (INR)</li>
                  <li>Payment confirmation is required to complete orders</li>
                  <li>We reserve the right to cancel orders for suspicious activities</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Refunds and Returns</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Refund requests must be submitted within 7 days of delivery</li>
                  <li>Items must be in original condition for returns</li>
                  <li>Refund approval is subject to admin review</li>
                  <li>Processing time for approved refunds is 5-7 business days</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Terms */}
          <Card>
            <CardHeader>
              <CardTitle>4. Vendor Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Vendor Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Provide accurate product descriptions and images</li>
                  <li>Maintain adequate inventory levels</li>
                  <li>Process orders within specified timeframes</li>
                  <li>Handle customer service for your products</li>
                  <li>Comply with all applicable business regulations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Commission and Fees</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    Platform commission rates and fee structures are provided separately in your vendor agreement. 
                    These may be updated with reasonable notice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Platform Content</h3>
                <p className="text-gray-700">
                  All content on our platform, including text, graphics, logos, and software, is our property or 
                  licensed to us and is protected by copyright and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">User Content</h3>
                <p className="text-gray-700">
                  By uploading content to our platform, you grant us a non-exclusive license to use, display, 
                  and distribute your content in connection with our services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-2">Important Limitations:</p>
                    <ul className="list-disc pl-6 space-y-1 text-yellow-700 text-sm">
                      <li>We provide the platform "as is" without warranties</li>
                      <li>We are not liable for indirect or consequential damages</li>
                      <li>Our liability is limited to the amount paid for services</li>
                      <li>We are not responsible for third-party vendor actions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle>7. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our data collection and usage practices are detailed in our 
                Privacy Policy, which forms part of these Terms.
              </p>
              <Link href="/policy" className="text-blue-600 hover:text-blue-700 font-medium">
                View Privacy Policy →
              </Link>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>8. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Termination by User</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting our support team. Upon termination, 
                  you remain liable for any outstanding obligations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Termination by Platform</h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
                  prohibited activities. We will provide reasonable notice except in cases of severe violations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>9. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We may update these Terms from time to time. Significant changes will be communicated via email 
                or platform notifications. Continued use of our services after changes constitutes acceptance of 
                the updated Terms.
              </p>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> We recommend reviewing these Terms periodically to stay informed of any updates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@ecommerce.com</p>
                <p><strong>Phone:</strong> +91 12345 67890</p>
                <p><strong>Address:</strong> Legal Department, E-commerce Platform, India</p>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-gray-600">
                For general support inquiries, please visit our <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact Page</Link>.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8 text-gray-600">
            <p className="text-sm">
              These Terms and Conditions are governed by the laws of India. Any disputes will be resolved 
              through binding arbitration in accordance with Indian law.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

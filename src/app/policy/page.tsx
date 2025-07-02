import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Lock, Eye, AlertTriangle, UserCheck } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-orange-400" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal
            information when you use ShopHub.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-green-600 text-white">
              <Calendar className="h-3 w-3 mr-1" />
              Last Updated: January 2024
            </Badge>
            <Badge className="bg-blue-600 text-white">
              <Lock className="h-3 w-3 mr-1" />
              GDPR Compliant
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <Card className="bg-blue-900/20 border-blue-600/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">Your Privacy Rights</h3>
                  <p className="text-blue-100">
                    We are committed to protecting your privacy and ensuring you have control over your personal data.
                    You have the right to access, update, or delete your information at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Section 1 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <h4 className="text-white font-semibold">Personal Information</h4>
                <p>
                  When you create an account or use our services, we may collect the following personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Account credentials (username, encrypted password)</li>
                  <li>Profile information and preferences</li>
                </ul>

                <h4 className="text-white font-semibold">Automatically Collected Information</h4>
                <p>We automatically collect certain information when you use our platform:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, clicks)</li>
                  <li>Location data (if you enable location services)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h4 className="text-white font-semibold">Business Information (Vendors)</h4>
                <p>For vendor accounts, we also collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Business name and registration details</li>
                  <li>Tax identification numbers</li>
                  <li>Bank account information for payments</li>
                  <li>Business address and contact information</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>We use your personal information for the following purposes:</p>

                <h4 className="text-white font-semibold">Service Provision</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Creating and managing your account</li>
                  <li>Processing orders and payments</li>
                  <li>Providing customer support</li>
                  <li>Facilitating communication between buyers and sellers</li>
                </ul>

                <h4 className="text-white font-semibold">Platform Improvement</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Analyzing usage patterns to improve our services</li>
                  <li>Personalizing your experience</li>
                  <li>Developing new features and functionality</li>
                  <li>Conducting research and analytics</li>
                </ul>

                <h4 className="text-white font-semibold">Communication</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sending order confirmations and updates</li>
                  <li>Providing important account notifications</li>
                  <li>Marketing communications (with your consent)</li>
                  <li>Responding to your inquiries</li>
                </ul>

                <h4 className="text-white font-semibold">Legal and Security</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Complying with legal obligations</li>
                  <li>Preventing fraud and abuse</li>
                  <li>Enforcing our terms of service</li>
                  <li>Protecting the rights and safety of users</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">3. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We do not sell your personal information. We may share your information in the following situations:
                </p>

                <h4 className="text-white font-semibold">With Your Consent</h4>
                <p>We share information when you explicitly consent to such sharing.</p>

                <h4 className="text-white font-semibold">Service Providers</h4>
                <p>We work with trusted third-party service providers who help us operate our platform:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payment processors (Stripe, PayPal, etc.)</li>
                  <li>Shipping and logistics partners</li>
                  <li>Cloud hosting providers</li>
                  <li>Analytics and marketing tools</li>
                </ul>

                <h4 className="text-white font-semibold">Business Transfers</h4>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part
                  of the transaction.
                </p>

                <h4 className="text-white font-semibold">Legal Requirements</h4>
                <p>We may disclose information when required by law or to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Comply with legal processes</li>
                  <li>Respond to government requests</li>
                  <li>Protect our rights and property</li>
                  <li>Ensure user safety</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">4. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>We implement comprehensive security measures to protect your personal information:</p>

                <h4 className="text-white font-semibold">Technical Safeguards</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Encrypted storage of sensitive data</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Secure authentication and access controls</li>
                </ul>

                <h4 className="text-white font-semibold">Organizational Measures</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Employee training on data protection</li>
                  <li>Limited access to personal information</li>
                  <li>Regular security policy updates</li>
                  <li>Incident response procedures</li>
                </ul>

                <div className="bg-yellow-900/20 border-yellow-600/30 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-100">
                        <strong>Important:</strong> While we implement strong security measures, no system is 100%
                        secure. Please use strong passwords and keep your account information confidential.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">5. Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>You have the following rights regarding your personal information:</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-400" />
                      <h4 className="text-white font-semibold">Right to Access</h4>
                    </div>
                    <p className="text-sm">Request a copy of the personal information we hold about you.</p>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-green-400" />
                      <h4 className="text-white font-semibold">Right to Rectification</h4>
                    </div>
                    <p className="text-sm">Request correction of inaccurate or incomplete information.</p>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <h4 className="text-white font-semibold">Right to Erasure</h4>
                    </div>
                    <p className="text-sm">Request deletion of your personal information in certain circumstances.</p>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-purple-400" />
                      <h4 className="text-white font-semibold">Right to Portability</h4>
                    </div>
                    <p className="text-sm">Request transfer of your data to another service provider.</p>
                  </div>
                </div>

                <h4 className="text-white font-semibold">How to Exercise Your Rights</h4>
                <p>To exercise any of these rights, please contact us at:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email: privacy@shophub.com</li>
                  <li>Through your account settings</li>
                  <li>Via our contact form</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">6. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>We use cookies and similar technologies to enhance your experience:</p>

                <h4 className="text-white font-semibold">Types of Cookies</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic site functionality
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> Help us understand how you use our site
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Remember your preferences and settings
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements
                  </li>
                </ul>

                <h4 className="text-white font-semibold">Managing Cookies</h4>
                <p>
                  You can control cookies through your browser settings. Note that disabling certain cookies may affect
                  site functionality.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">7. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes</li>
                  <li>Enforce our agreements</li>
                </ul>

                <p>
                  When you delete your account, we will delete or anonymize your personal information within 30 days,
                  except where we are required to retain it for legal purposes.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">8. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure
                  appropriate safeguards are in place to protect your data during international transfers.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">9. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13. If you believe we have collected information from a child under
                  13, please contact us immediately.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">10. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending you an email notification</li>
                  <li>Displaying a prominent notice on our platform</li>
                </ul>
                <p>
                  Your continued use of our services after any changes constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Privacy Officer:</strong> privacy@shophub.com
                  </p>
                  <p>
                    <strong>Address:</strong> 123 Commerce Street, Business District, New York, NY 10001
                  </p>
                  <p>
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

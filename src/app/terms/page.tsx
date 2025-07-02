import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FileText className="h-8 w-8 text-orange-400" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Please read these terms carefully before using ShopHub. By accessing our platform, you agree to be bound by
            these terms.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-green-600 text-white">
              <Calendar className="h-3 w-3 mr-1" />
              Last Updated: January 2024
            </Badge>
            <Badge className="bg-blue-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Version 2.1
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <Card className="bg-yellow-900/20 border-yellow-600/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Important Notice</h3>
                  <p className="text-yellow-100">
                    These terms constitute a legally binding agreement between you and ShopHub. Please read them
                    carefully and contact us if you have any questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Section 1 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  By accessing and using ShopHub ("the Platform"), you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our website located at shophub.com (the "Service")
                  operated by ShopHub Inc. ("us", "we", or "our").
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">2. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <h4 className="text-white font-semibold">Account Creation</h4>
                <p>
                  To access certain features of the Service, you must register for an account. You may be required to
                  provide certain personal information, including but not limited to your name, email address, and
                  contact information.
                </p>

                <h4 className="text-white font-semibold">Account Security</h4>
                <p>
                  You are responsible for safeguarding the password and for maintaining the confidentiality of your
                  account. You agree not to disclose your password to any third party and to take sole responsibility
                  for any activities or actions under your account.
                </p>

                <h4 className="text-white font-semibold">Account Types</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Customer Accounts:</strong> For purchasing products and services
                  </li>
                  <li>
                    <strong>Vendor Accounts:</strong> For selling products (subject to approval)
                  </li>
                  <li>
                    <strong>Admin Accounts:</strong> For platform management (restricted access)
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">3. Use of the Platform</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <h4 className="text-white font-semibold">Permitted Use</h4>
                <p>
                  You may use our platform for lawful purposes only. You agree to use the Service in compliance with all
                  applicable laws and regulations.
                </p>

                <h4 className="text-white font-semibold">Prohibited Activities</h4>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform for any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>
                    Violate any international, federal, provincial, or state regulations, rules, laws, or local
                    ordinances
                  </li>
                  <li>
                    Infringe upon or violate our intellectual property rights or the intellectual property rights of
                    others
                  </li>
                  <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>Submit false or misleading information</li>
                  <li>Upload or transmit viruses or any other type of malicious code</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">4. Vendor Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <h4 className="text-white font-semibold">Vendor Approval</h4>
                <p>
                  All vendor accounts are subject to approval by our admin team. We reserve the right to reject any
                  vendor application at our sole discretion.
                </p>

                <h4 className="text-white font-semibold">Product Listings</h4>
                <p>
                  Vendors are responsible for the accuracy of their product listings, including descriptions, prices,
                  and availability. All products must comply with applicable laws and our content policies.
                </p>

                <h4 className="text-white font-semibold">Commission and Fees</h4>
                <p>
                  ShopHub charges a commission on each sale made through the platform. Current commission rates and fee
                  structures are available in your vendor dashboard.
                </p>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">5. Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <h4 className="text-white font-semibold">Payment Processing</h4>
                <p>
                  All payments are processed through secure third-party payment processors. We do not store your payment
                  information on our servers.
                </p>

                <h4 className="text-white font-semibold">Refunds and Returns</h4>
                <p>
                  Refund and return policies are determined by individual vendors, subject to our minimum standards.
                  Customers have the right to return products within 30 days of purchase for most categories.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">6. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                  information when you use our Service. By using our Service, you agree to the collection and use of
                  information in accordance with our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">7. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive
                  property of ShopHub Inc. and its licensors. The Service is protected by copyright, trademark, and
                  other laws.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">8. Termination</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever and without limitation,
                  including but not limited to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may simply discontinue using the Service or contact us to
                  request account deletion.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">9. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  In no event shall ShopHub Inc., nor its directors, employees, partners, agents, suppliers, or
                  affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                  resulting from your use of the Service.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">10. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                  revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
                <p>
                  What constitutes a material change will be determined at our sole discretion. By continuing to access
                  or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>If you have any questions about these Terms of Service, please contact us at:</p>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Email:</strong> legal@shophub.com
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

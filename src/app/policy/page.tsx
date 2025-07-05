"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Shield, Calendar, Lock, Eye, UserCheck, ChevronDown, ChevronUp, Download, Printer, Mail } from "lucide-react"

const policyData = [
  {
    id: "collection",
    title: "1. Information We Collect",
    content: `We collect several types of information from and about users of our service:

Personal Information:
• Name, email address, phone number, and mailing address
• Payment information (processed securely by third-party providers)
• Account credentials and preferences

Usage Information:
• Device information (IP address, browser type, operating system)
• Usage patterns and interaction data
• Cookies and similar tracking technologies

Business Information (for vendors):
• Business name, address, and registration details
• Tax identification numbers
• Banking and payment details`
  },
  {
    id: "usage",
    title: "2. How We Use Your Information",
    content: `We use the information we collect for various purposes:

Service Provision:
• Create and manage your account
• Process transactions and payments
• Provide customer support

Improvement and Personalization:
• Analyze usage patterns to improve our services
• Personalize content and recommendations
• Conduct research and analytics

Communication:
• Send promotional offers and marketing communications (with consent)
• Respond to your inquiries and requests
• Provide technical support`
  },
  {
    id: "security",
    title: "3. Data Security",
    content: `We implement comprehensive security measures to protect your information:

Technical Safeguards:
• Industry-standard encryption for data transmission
• Secure storage with access controls
• Regular security audits and vulnerability assessments

Organizational Measures:
• Employee training on data protection
• Limited access on a need-to-know basis
• Regular security policy updates

Payment Security:
• PCI DSS compliant payment processing
• Tokenization of sensitive payment data
• Secure communication channels`
  },
  {
    id: "rights",
    title: "4. Your Privacy Rights",
    content: `You have several rights regarding your personal information:

Access and Portability:
• Request a copy of your personal data
• Export your data in a machine-readable format

Correction and Update:
• Correct inaccurate personal information
• Update outdated information

Deletion:
• Request deletion of your personal data
• Right to be forgotten (subject to legal requirements)
• Account closure and data removal`
  }
]

export default function PrivacyPolicyPage() {
  const [openSections, setOpenSections] = useState<string[]>(["collection"])

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([
      `ShopHub Privacy Policy\n\n${policyData.map(section => 
        `${section.title}\n${section.content}\n\n`
      ).join('')}`
    ], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'shophub-privacy-policy.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="h-10 w-10 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use ShopHub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Last Updated: January 2024
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
              <Lock className="h-4 w-4 mr-2" />
              GDPR Compliant
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Privacy Promise */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <UserCheck className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Our Privacy Promise</h3>
                <p className="text-gray-600">
                  We are committed to protecting your privacy and ensuring transparency in how we handle your data. 
                  We will never sell your personal information and will always seek your consent for data processing activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-4">
          {policyData.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <Collapsible 
                open={openSections.includes(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </CardTitle>
                      {openSections.includes(section.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-6">
                    <div className="prose prose-gray max-w-none">
                      {section.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-indigo-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About Your Privacy?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your data, our privacy team is here to help. 
              Contact us anytime for clarification or to exercise your privacy rights.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="default">
                <Mail className="h-4 w-4 mr-2" />
                Contact Privacy Team
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

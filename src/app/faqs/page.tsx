'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Loader2, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Hardcoded initial FAQs
const initialFAQs = [
  {
    id: "1",
    question: "How do I create an account?",
    answer: "Click 'Sign Up' and choose your account type (Customer, Vendor, or Admin). Fill in your details, verify your email and mobile number, and you're ready to start!"
  },
  {
    id: "2", 
    question: "What payment methods do you accept?",
    answer: "We accept Credit/Debit Cards, UPI payments, Net Banking, and Digital Wallets. All payments are processed securely through Razorpay."
  },
  {
    id: "3",
    question: "How long does delivery take?",
    answer: "Standard delivery takes 3-7 business days, while express delivery takes 1-2 business days. Delivery times may vary for remote locations."
  },
  {
    id: "4",
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy from delivery date. Items must be unused, in original packaging with tags intact."
  }
]

export default function FAQsPage() {
  const [faqs, setFaqs] = useState(initialFAQs)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasLoadedMore, setHasLoadedMore] = useState(false)

  const loadMoreFAQs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/faqs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Generate more e-commerce related FAQs',
          count: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.faqs) {
          setFaqs(prev => [...prev, ...data.faqs])
          setHasLoadedMore(true)
        } else {
          console.error('Failed to load more FAQs:', data.error)
        }
      } else {
        console.error('Error response:', response.status)
      }
    } catch (error) {
      console.error('Error loading more FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter FAQs based on search term
  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about our e-commerce platform, orders, payments, and more.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-lg"
        />
      </div>

      {/* FAQs Accordion */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Common Questions</span>
            <span className="text-sm font-normal text-gray-500">
              ({filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'})
            </span>
          </CardTitle>
          <CardDescription>
            Click on any question to view the answer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left hover:text-blue-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>No FAQs found matching your search.</p>
              <p className="text-sm">Try different keywords or browse all questions.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load More Button */}
      {!hasLoadedMore && searchTerm === '' && (
        <div className="text-center">
          <Button 
            onClick={loadMoreFAQs} 
            disabled={loading}
            size="lg"
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading More FAQs...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                More FAQs
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Get AI-generated FAQs relevant to e-commerce
          </p>
        </div>
      )}

      {hasLoadedMore && (
        <div className="text-center text-sm text-gray-500">
          <p>✅ All available FAQs have been loaded</p>
        </div>
      )}

      {/* Contact Section */}
      <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-900">Still have questions?</CardTitle>
          <CardDescription className="text-blue-700">
            Can't find what you're looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Email:</strong> khanshariq92213@gmail.com</p>
            <p><strong>Phone:</strong> +91 72081 79779</p>
            <p><strong>Hours:</strong> Monday-Saturday, 9 AM to 6 PM IST</p>
          </div>
          <Button className="mt-4" variant="default">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

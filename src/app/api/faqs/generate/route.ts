import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google AI if API key is available
const genAI = process.env.GOOGLE_AI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const { query, count = 10 } = await request.json()

    if (!query) {
      return NextResponse.json({
        success: false,
        error: "Query is required"
      }, { status: 400 })
    }

    // Check if Google AI is configured
    if (!genAI) {
      // Fallback to predefined FAQs if AI is not configured
      const fallbackFAQs = [
        {
          id: "fb1",
          question: "How do I track my order?",
          answer: "Visit 'My Orders' in your account dashboard to view order status. You'll also receive SMS and email updates with tracking information."
        },
        {
          id: "fb2",
          question: "Is my payment information secure?",
          answer: "Yes! We use industry-standard SSL encryption and secure payment gateways. We never store your complete card details."
        },
        {
          id: "fb3",
          question: "Can I cancel my order?",
          answer: "Yes, you can cancel orders before they're shipped. Go to 'My Orders' and click 'Cancel'. Refunds are processed within 5-7 business days."
        },
        {
          id: "fb4",
          question: "Do you offer express delivery?",
          answer: "Yes, express delivery is available for an additional charge. It takes 1-2 business days compared to standard 3-7 days."
        },
        {
          id: "fb5",
          question: "How can I become a seller?",
          answer: "Register as a Vendor with your business details, PAN number, and GST. Upload required documents for verification to start selling."
        },
        {
          id: "fb6",
          question: "What if my payment fails?",
          answer: "Failed payments are automatically refunded within 3-5 business days. You can retry with a different payment method."
        }
      ]

      return NextResponse.json({
        success: true,
        faqs: fallbackFAQs.slice(0, count),
        source: "fallback",
        message: "AI not configured, using predefined FAQs"
      })
    }

    // Generate FAQs using Google AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Generate ${count} realistic and helpful FAQ items for an e-commerce platform. 
    Each FAQ should include a question and detailed answer.
    
    Topics to cover (choose relevant ones):
    - Account management and registration
    - Order placement and tracking
    - Payment methods and security
    - Shipping and delivery options
    - Return and refund policies
    - Vendor/seller information
    - Customer support
    - Product inquiries
    - Website features
    
    Format the response as a JSON array with objects containing:
    - id: unique identifier (string)
    - question: the FAQ question (string)
    - answer: detailed helpful answer (string)
    
    Make sure the answers are specific to an e-commerce platform and provide actionable information.
    Keep questions concise and answers informative but not too long.
    
    Return only the JSON array, no additional text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      // Parse the AI response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      const generatedFAQs = JSON.parse(cleanedText)

      // Validate the response structure
      if (!Array.isArray(generatedFAQs)) {
        throw new Error("AI response is not an array")
      }

      // Ensure each FAQ has required fields
      const validFAQs = generatedFAQs.filter(faq => 
        faq.id && faq.question && faq.answer &&
        typeof faq.id === 'string' &&
        typeof faq.question === 'string' &&
        typeof faq.answer === 'string'
      ).slice(0, count)

      if (validFAQs.length === 0) {
        throw new Error("No valid FAQs generated")
      }

      return NextResponse.json({
        success: true,
        faqs: validFAQs,
        source: "ai",
        message: `Generated ${validFAQs.length} FAQs using AI`
      })

    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.error("AI response text:", text)
      
      // Return fallback FAQs if AI parsing fails
      const fallbackFAQs = [
        {
          id: "ai_fb1",
          question: "How do I update my profile information?",
          answer: "Go to Account Settings to update personal information, addresses, and preferences. Changes to email or mobile require verification."
        },
        {
          id: "ai_fb2",
          question: "What are the shipping charges?",
          answer: "Shipping charges vary by location and order value. Orders above ₹500 qualify for free shipping. Express delivery available for additional charge."
        },
        {
          id: "ai_fb3",
          question: "How do I contact customer support?",
          answer: "Reach us via email at khanshariq92213@gmail.com, call +91 72081 79779, or use the Contact form. Support available Monday-Saturday, 9 AM to 6 PM IST."
        }
      ]

      return NextResponse.json({
        success: true,
        faqs: fallbackFAQs.slice(0, count),
        source: "fallback",
        message: "AI parsing failed, using fallback FAQs"
      })
    }

  } catch (error: any) {
    console.error("FAQ generation error:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to generate FAQs",
      details: error.message
    }, { status: 500 })
  }
}

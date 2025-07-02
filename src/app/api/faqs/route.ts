import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Static FAQ data
const staticFAQs = [
  {
    id: "1",
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking the 'Sign Up' button and choosing your account type (Customer, Vendor, or Admin). Fill in the required information and verify your email address.",
    category: "account",
    priority: 1,
  },
  {
    id: "2",
    question: "How do I become a vendor?",
    answer:
      "To become a vendor, sign up for a vendor account, provide your business information, and wait for admin approval. Once approved, you can start listing your products.",
    category: "vendor",
    priority: 2,
  },
  {
    id: "3",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, UPI payments, and digital wallets. All payments are processed securely through our payment partners.",
    category: "payment",
    priority: 1,
  },
  {
    id: "4",
    question: "How do I track my order?",
    answer:
      "You can track your order by logging into your account and visiting the 'My Orders' section. You'll receive tracking information via email once your order is shipped.",
    category: "orders",
    priority: 1,
  },
  {
    id: "5",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some categories may have different return policies.",
    category: "returns",
    priority: 2,
  },
  {
    id: "6",
    question: "How do I contact customer support?",
    answer:
      "You can contact our customer support team through the Contact page, email us at support@shophub.com, or call us at +1 (555) 123-4567 during business hours.",
    category: "support",
    priority: 1,
  },
  {
    id: "7",
    question: "Can I change or cancel my order?",
    answer:
      "You can change or cancel your order within 1 hour of placing it. After that, please contact customer support for assistance.",
    category: "orders",
    priority: 2,
  },
  {
    id: "8",
    question: "How do I reset my password?",
    answer:
      "Click on 'Forgot Password' on the sign-in page, enter your email address, and follow the instructions sent to your email to reset your password.",
    category: "account",
    priority: 1,
  },
  {
    id: "9",
    question: "Do you offer international shipping?",
    answer:
      "Currently, we only ship within the United States. We're working on expanding to international markets in the future.",
    category: "shipping",
    priority: 2,
  },
  {
    id: "10",
    question: "How do I add products as a vendor?",
    answer:
      "Once your vendor account is approved, log into your vendor dashboard and click 'Add New Product'. Fill in all required information including images, descriptions, and pricing.",
    category: "vendor",
    priority: 2,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const useAI = searchParams.get("ai") === "true"

    let faqs = staticFAQs

    // Filter by category if provided
    if (category && category !== "all") {
      faqs = faqs.filter((faq) => faq.category === category)
    }

    // If AI is requested and there's a query, use AI to enhance results
    if (useAI && query) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = `
        Based on the user query: "${query}"
        
        Here are our available FAQs:
        ${JSON.stringify(faqs, null, 2)}
        
        Please:
        1. Rank the most relevant FAQs for this query (return their IDs in order of relevance)
        2. If the query doesn't match any FAQ well, suggest what new FAQ might be needed
        3. Provide a brief explanation of why these FAQs are relevant
        
        Respond in JSON format:
        {
          "relevantFAQIds": ["id1", "id2", ...],
          "explanation": "Brief explanation",
          "suggestedNewFAQ": "Suggested question if needed"
        }
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        try {
          const aiResponse = JSON.parse(text)

          // Reorder FAQs based on AI relevance
          if (aiResponse.relevantFAQIds && aiResponse.relevantFAQIds.length > 0) {
            const orderedFAQs = []
            const remainingFAQs = [...faqs]

            // Add FAQs in AI-suggested order
            for (const id of aiResponse.relevantFAQIds) {
              const faq = remainingFAQs.find((f) => f.id === id)
              if (faq) {
                orderedFAQs.push(faq)
                remainingFAQs.splice(remainingFAQs.indexOf(faq), 1)
              }
            }

            // Add remaining FAQs
            orderedFAQs.push(...remainingFAQs)
            faqs = orderedFAQs
          }

          return NextResponse.json({
            faqs,
            aiInsights: {
              explanation: aiResponse.explanation,
              suggestedNewFAQ: aiResponse.suggestedNewFAQ,
            },
          })
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError)
          // Fall back to regular FAQ response
        }
      } catch (aiError) {
        console.error("AI API Error:", aiError)
        // Fall back to regular FAQ response
      }
    }

    // Regular search without AI
    if (query) {
      const searchTerm = query.toLowerCase()
      faqs = faqs.filter(
        (faq) => faq.question.toLowerCase().includes(searchTerm) || faq.answer.toLowerCase().includes(searchTerm),
      )
    }

    // Sort by priority
    faqs.sort((a, b) => a.priority - b.priority)

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error("FAQ API Error:", error)
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

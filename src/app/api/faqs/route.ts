import { type NextRequest, NextResponse } from "next/server"

// Static FAQ data - in a real app, this would come from a database
const staticFAQs = [
  {
    id: "1",
    question: "How do I create an account?",
    answer: "You can create an account by clicking the 'Sign Up' button and choosing your account type (Customer, Vendor, or Admin). Fill in the required information and verify your email address. The process is quick and secure, taking only a few minutes to complete.",
    category: "account",
    priority: 1,
    tags: ["signup", "registration", "account", "email"],
    helpful: 89,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    question: "How do I become a vendor?",
    answer: "To become a vendor, sign up for a vendor account, provide your business information including business registration details, tax information, and banking details. Wait for admin approval which typically takes 24-48 hours. Once approved, you can start listing your products and managing your store.",
    category: "vendor",
    priority: 2,
    tags: ["vendor", "business", "selling", "approval"],
    helpful: 76,
    lastUpdated: "2024-01-10",
  },
  {
    id: "3",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, UPI payments (GPay, PhonePe, Paytm), net banking, and digital wallets. All payments are processed securely through our certified payment partners with end-to-end encryption.",
    category: "payment",
    priority: 1,
    tags: ["payment", "cards", "upi", "wallet", "security"],
    helpful: 134,
    lastUpdated: "2024-01-12",
  },
  {
    id: "4",
    question: "How do I track my order?",
    answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll receive tracking information via email and SMS once your order is shipped. You can also use the tracking number on the shipping partner's website for real-time updates.",
    category: "orders",
    priority: 1,
    tags: ["tracking", "orders", "shipping", "status"],
    helpful: 156,
    lastUpdated: "2024-01-14",
  },
  {
    id: "5",
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items. Products must be in original condition with tags attached and original packaging. Electronics have a 15-day return window. Some categories like perishables and personalized items cannot be returned. Return shipping is free for defective items.",
    category: "returns",
    priority: 2,
    tags: ["returns", "refund", "policy", "conditions"],
    helpful: 98,
    lastUpdated: "2024-01-08",
  },
  {
    id: "6",
    question: "How do I contact customer support?",
    answer: "You can contact our customer support team through multiple channels: Live chat (available 9 AM - 9 PM), email at support@shophub.com, phone at +91-800-SHOPHUB, or through the contact form on our website. We typically respond within 2-4 hours during business hours.",
    category: "support",
    priority: 1,
    tags: ["support", "contact", "help", "chat"],
    helpful: 112,
    lastUpdated: "2024-01-16",
  },
  {
    id: "7",
    question: "How long does shipping take?",
    answer: "Shipping times vary by location and product: Metro cities: 1-2 business days, Other cities: 2-4 business days, Remote areas: 4-7 business days. Express delivery is available in select cities for same-day or next-day delivery. You'll see estimated delivery dates at checkout.",
    category: "shipping",
    priority: 1,
    tags: ["shipping", "delivery", "time", "express"],
    helpful: 87,
    lastUpdated: "2024-01-11",
  },
  {
    id: "8",
    question: "Is my personal information secure?",
    answer: "Yes, we take data security very seriously. We use industry-standard SSL encryption, secure servers, and comply with data protection regulations. We never share your personal information with third parties without consent. Our privacy policy details how we protect and use your data.",
    category: "security",
    priority: 2,
    tags: ["security", "privacy", "data", "protection"],
    helpful: 145,
    lastUpdated: "2024-01-13",
  },
  {
    id: "9",
    question: "Can I change or cancel my order?",
    answer: "You can modify or cancel your order within 1 hour of placing it, provided it hasn't been shipped. Go to 'My Orders' and click 'Modify' or 'Cancel'. If the order has already been processed, you can return it once delivered according to our return policy.",
    category: "orders",
    priority: 2,
    tags: ["cancel", "modify", "orders", "change"],
    helpful: 73,
    lastUpdated: "2024-01-09",
  },
  {
    id: "10",
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within India. We're working on expanding to international markets and will announce when international shipping becomes available. You can subscribe to our newsletter to get notified about this update.",
    category: "shipping",
    priority: 3,
    tags: ["international", "shipping", "global", "expansion"],
    helpful: 45,
    lastUpdated: "2024-01-07",
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const query = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "50")

    let filteredFAQs = [...staticFAQs]

    // Filter by category
    if (category && category !== "all") {
      filteredFAQs = filteredFAQs.filter((faq) => faq.category === category)
    }

    // Search functionality
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredFAQs = filteredFAQs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm) ||
          faq.answer.toLowerCase().includes(searchTerm) ||
          faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Sort by priority and helpfulness
    filteredFAQs.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return b.helpful - a.helpful
    })

    // Apply limit
    filteredFAQs = filteredFAQs.slice(0, limit)

    // Get categories with counts
    const categories = [
      { value: "all", label: "All Categories", count: staticFAQs.length },
      { value: "account", label: "Account", count: staticFAQs.filter(f => f.category === "account").length },
      { value: "orders", label: "Orders", count: staticFAQs.filter(f => f.category === "orders").length },
      { value: "payment", label: "Payment", count: staticFAQs.filter(f => f.category === "payment").length },
      { value: "shipping", label: "Shipping", count: staticFAQs.filter(f => f.category === "shipping").length },
      { value: "returns", label: "Returns", count: staticFAQs.filter(f => f.category === "returns").length },
      { value: "vendor", label: "Vendor", count: staticFAQs.filter(f => f.category === "vendor").length },
      { value: "support", label: "Support", count: staticFAQs.filter(f => f.category === "support").length },
      { value: "security", label: "Security", count: staticFAQs.filter(f => f.category === "security").length },
    ]

    return NextResponse.json({
      faqs: filteredFAQs,
      categories,
      total: filteredFAQs.length,
      query: query || "",
      selectedCategory: category || "all"
    })
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, suggestedAnswer, userEmail } = body

    if (!question || question.length < 10) {
      return NextResponse.json(
        { error: "Question must be at least 10 characters long" },
        { status: 400 }
      )
    }

    // In a real app, this would be saved to a database and reviewed by admins
    const newFAQRequest = {
      id: Date.now().toString(),
      question,
      suggestedAnswer: suggestedAnswer || "",
      userEmail: userEmail || "anonymous",
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // For demo purposes, we'll just return success
    return NextResponse.json({
      message: "Thank you for your question! Our team will review it and add it to our FAQ if helpful for other users.",
      requestId: newFAQRequest.id,
    })
  } catch (error) {
    console.error("Error submitting FAQ request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
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

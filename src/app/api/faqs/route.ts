import { NextRequest, NextResponse } from "next/server"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const ecommerceFAQs: FAQ[] = [
  // Account & Registration
  {
    id: "account-01",
    question: "How do I create an account?",
    answer: "To create an account, click the 'Sign Up' button in the top right corner. You can register as a Customer, Vendor, or Admin. Fill in your details including name, email, password, and phone number. You'll receive verification emails and SMS to confirm your account.",
    category: "account",
    tags: ["registration", "signup", "account creation"]
  },
  {
    id: "account-02",
    question: "I forgot my password. How can I reset it?",
    answer: "Click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    category: "account",
    tags: ["password", "reset", "forgot"]
  },
  {
    id: "account-03",
    question: "How do I verify my email and mobile number?",
    answer: "After registration, check your email and mobile for verification codes. Enter these codes on the verification page. Email verification helps secure your account, while mobile verification enables order updates and SMS notifications.",
    category: "account",
    tags: ["verification", "email", "mobile", "sms"]
  },

  // Orders & Shopping
  {
    id: "order-01",
    question: "How do I place an order?",
    answer: "Browse products, add items to your cart, and proceed to checkout. Enter your shipping address, select payment method, and confirm your order. You'll receive an order confirmation email with tracking details.",
    category: "orders",
    tags: ["place order", "checkout", "shopping"]
  },
  {
    id: "order-02",
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel orders within 30 minutes of placement, provided they haven't been processed. Go to 'My Orders' in your account dashboard and click 'Modify' or 'Cancel'. After processing, modifications aren't possible.",
    category: "orders",
    tags: ["cancel", "modify", "order management"]
  },
  {
    id: "order-03",
    question: "How can I track my order?",
    answer: "Visit 'My Orders' in your account dashboard to view order status. You'll also receive SMS and email updates. Once shipped, you'll get a tracking number to monitor your package in real-time.",
    category: "orders",
    tags: ["tracking", "order status", "shipping"]
  },

  // Payments
  {
    id: "payment-01",
    question: "What payment methods do you accept?",
    answer: "We accept Credit/Debit Cards (Visa, Mastercard, Rupay), UPI payments, Net Banking, and Digital Wallets (Paytm, PhonePe, Google Pay). All payments are processed securely through Razorpay.",
    category: "payment",
    tags: ["payment methods", "cards", "upi", "wallet"]
  },
  {
    id: "payment-02",
    question: "Is my payment information secure?",
    answer: "Yes, absolutely! We use Razorpay's secure payment gateway with 256-bit SSL encryption. We never store your complete card details on our servers. All transactions comply with PCI DSS standards.",
    category: "payment",
    tags: ["security", "ssl", "encryption", "razorpay"]
  },
  {
    id: "payment-03",
    question: "What if my payment fails?",
    answer: "If payment fails, the amount will be automatically refunded to your account within 3-5 business days. You can retry payment or choose a different payment method. Contact support if you continue facing issues.",
    category: "payment",
    tags: ["failed payment", "refund", "retry"]
  },

  // Shipping & Delivery
  {
    id: "shipping-01",
    question: "What are the shipping charges?",
    answer: "Shipping charges vary by location and order value. Orders above ₹500 qualify for free shipping. Express delivery is available for an additional charge. Exact shipping costs are shown at checkout.",
    category: "shipping",
    tags: ["shipping charges", "free shipping", "delivery"]
  },
  {
    id: "shipping-02",
    question: "How long does delivery take?",
    answer: "Standard delivery takes 3-7 business days, while express delivery takes 1-2 business days. Delivery times may vary for remote locations. You'll get estimated delivery dates at checkout.",
    category: "shipping",
    tags: ["delivery time", "express delivery", "standard delivery"]
  },
  {
    id: "shipping-03",
    question: "Do you deliver to my location?",
    answer: "We deliver across India to most PIN codes. Enter your PIN code on the product page to check delivery availability. Some remote areas might have limited delivery options.",
    category: "shipping",
    tags: ["delivery areas", "pin code", "coverage"]
  },

  // Returns & Refunds
  {
    id: "return-01",
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy from delivery date. Items must be unused, in original packaging with tags intact. Some categories like personal care items are non-returnable for hygiene reasons.",
    category: "returns",
    tags: ["return policy", "7 days", "unused items"]
  },
  {
    id: "return-02",
    question: "How do I return an item?",
    answer: "Go to 'My Orders', select the item to return, choose return reason, and schedule pickup. Our delivery partner will collect the item from your address. You can also request a refund through the return process.",
    category: "returns",
    tags: ["return process", "pickup", "refund request"]
  },
  {
    id: "return-03",
    question: "When will I get my refund?",
    answer: "Refunds are processed within 7-10 business days after we receive the returned item. The amount will be credited to your original payment method. For UPI/Wallet payments, refunds are usually faster.",
    category: "returns",
    tags: ["refund timeline", "credit", "processing"]
  },

  // Vendor Related
  {
    id: "vendor-01",
    question: "How can I become a seller on ShopHub?",
    answer: "Register as a Vendor with your business details, PAN number, and GST (if applicable). Upload required documents for verification. Once approved, you can start listing products and selling on our platform.",
    category: "vendor",
    tags: ["become seller", "vendor registration", "business"]
  },
  {
    id: "vendor-02",
    question: "What documents do I need to sell?",
    answer: "You need PAN card, business registration certificate, GST certificate (if applicable), bank account details, and address proof. Valid contact information and UPI ID are also required for payments.",
    category: "vendor",
    tags: ["documents", "pan", "gst", "verification"]
  },
  {
    id: "vendor-03",
    question: "How do I manage my inventory and orders?",
    answer: "Use the Vendor Dashboard to manage products, track inventory, process orders, and view analytics. You can update stock levels, manage pricing, and communicate with customers through the platform.",
    category: "vendor",
    tags: ["inventory", "vendor dashboard", "order management"]
  },

  // Support & General
  {
    id: "support-01",
    question: "How can I contact customer support?",
    answer: "Reach us via email at khanshariq92213@gmail.com, call +91 72081 79779, or use the Contact form on our website. Our support team is available Monday-Saturday, 9 AM to 6 PM IST.",
    category: "support",
    tags: ["contact support", "email", "phone", "hours"]
  },
  {
    id: "support-02",
    question: "Do you have a mobile app?",
    answer: "Currently, we're a web-based platform optimized for mobile browsers. We're working on native mobile apps for Android and iOS, which will be available soon with enhanced features.",
    category: "support",
    tags: ["mobile app", "website", "mobile browser"]
  },
  {
    id: "support-03",
    question: "How do I update my profile information?",
    answer: "Go to your Account Settings to update personal information, addresses, and preferences. Changes to email or mobile number require verification. Profile updates are saved automatically.",
    category: "support",
    tags: ["profile update", "account settings", "personal info"]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const query = searchParams.get('q') || ''

    let filteredFAQs = ecommerceFAQs

    // Filter by category
    if (category !== 'all') {
      filteredFAQs = filteredFAQs.filter(faq => faq.category === category)
    }

    // Filter by search query
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredFAQs = filteredFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Sort by relevance (questions matching search query first)
    if (query) {
      filteredFAQs.sort((a, b) => {
        const searchTerm = query.toLowerCase()
        const aQuestionMatch = a.question.toLowerCase().includes(searchTerm)
        const bQuestionMatch = b.question.toLowerCase().includes(searchTerm)
        
        if (aQuestionMatch && !bQuestionMatch) return -1
        if (!aQuestionMatch && bQuestionMatch) return 1
        return 0
      })
    }

    return NextResponse.json({
      success: true,
      faqs: filteredFAQs,
      total: filteredFAQs.length,
      categories: [
        { value: "all", label: "All Categories", count: ecommerceFAQs.length },
        { value: "account", label: "Account & Registration", count: ecommerceFAQs.filter(f => f.category === 'account').length },
        { value: "orders", label: "Orders & Shopping", count: ecommerceFAQs.filter(f => f.category === 'orders').length },
        { value: "payment", label: "Payments", count: ecommerceFAQs.filter(f => f.category === 'payment').length },
        { value: "shipping", label: "Shipping & Delivery", count: ecommerceFAQs.filter(f => f.category === 'shipping').length },
        { value: "returns", label: "Returns & Refunds", count: ecommerceFAQs.filter(f => f.category === 'returns').length },
        { value: "vendor", label: "Vendor & Selling", count: ecommerceFAQs.filter(f => f.category === 'vendor').length },
        { value: "support", label: "Support & General", count: ecommerceFAQs.filter(f => f.category === 'support').length }
      ]
    })
  } catch (error) {
    console.error('FAQs API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch FAQs',
        faqs: [],
        total: 0
      },
      { status: 500 }
    )
  }
}

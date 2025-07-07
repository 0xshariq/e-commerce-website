import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  category: z.enum(["general", "support", "business", "technical"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = ContactSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, subject, message, category } = validation.data

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    
    console.log("Contact form submission:", {
      name,
      email,
      subject,
      category,
      message,
      timestamp: new Date().toISOString(),
    })

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json(
      { message: "Thank you for contacting us. We'll get back to you soon!" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { FAQ } from "@/models/faq"
import mongoose from "mongoose"

// POST /api/faqs/[faqId]/view - Increment view count for FAQ
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ faqId: string }> }
) {
  try {
    const params = await context.params
    await connectDB()
    
    const { faqId } = params
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(faqId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      )
    }
    
    // Increment view count
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      faqId,
      { $inc: { views: 1 } },
      { new: true, runValidators: true }
    )
    
    if (!updatedFAQ) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        faqId,
        views: updatedFAQ.views
      }
    })
    
  } catch (error: any) {
    console.error('Error incrementing FAQ views:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}

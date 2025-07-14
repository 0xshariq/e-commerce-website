import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { FAQ } from "@/models/faq"
import mongoose from "mongoose"

// POST /api/faqs/[id]/view - Increment view count for FAQ
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await connectDB()
    
    const { id } = params
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      )
    }
    
    // Increment view count
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
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
        id,
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

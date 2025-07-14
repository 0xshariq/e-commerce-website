import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { FAQ } from "@/models/faq"
import mongoose from "mongoose"

// POST /api/faqs/[id]/feedback - Submit feedback for FAQ
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await connectDB()
    
    const { id } = params
    const body = await request.json()
    const { type } = body
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      )
    }
    
    if (!type || !['helpful', 'notHelpful'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback type. Use "helpful" or "notHelpful"' },
        { status: 400 }
      )
    }
    
    // Update FAQ feedback count
    const updateField = type === 'helpful' ? 'helpful' : 'notHelpful'
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { $inc: { [updateField]: 1 } },
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
        type,
        helpful: updatedFAQ.helpful,
        notHelpful: updatedFAQ.notHelpful
      }
    })
    
  } catch (error: any) {
    console.error('Error submitting FAQ feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

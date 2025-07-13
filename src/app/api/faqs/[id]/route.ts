import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { FAQ } from "@/models/faq"
import mongoose from "mongoose"

// POST /api/faqs/[id]/feedback - Record FAQ feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    const { helpful } = body
    
    // Validate FAQ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      )
    }
    
    // Validate feedback
    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Feedback must be true (helpful) or false (not helpful)' },
        { status: 400 }
      )
    }
    
    // Update FAQ feedback
    const updateField = helpful ? 'helpful' : 'notHelpful'
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { $inc: { [updateField]: 1 } },
      { new: true }
    )
    
    if (!faq) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        helpful: faq.helpful,
        notHelpful: faq.notHelpful,
        helpfulnessScore: faq.helpfulnessScore
      },
      message: 'Feedback recorded successfully'
    })
    
  } catch (error: any) {
    console.error('Error recording FAQ feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record feedback' },
      { status: 500 }
    )
  }
}

// GET /api/faqs/[id] - Get specific FAQ and increment view count
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = await params
    
    // Validate FAQ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      )
    }
    
    // Find FAQ and increment view count
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
    
    if (!faq || !faq.isActive) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: faq
    })
    
  } catch (error: any) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQ' },
      { status: 500 }
    )
  }
}

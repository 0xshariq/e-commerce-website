import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { Category } from "@/models/category"

export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find({ status: "active" })
      .select("name description")
      .sort({ name: 1 })

    return NextResponse.json({
      categories,
      total: categories.length
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    await connectDB()

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 })
    }

    const category = new Category({
      name,
      description: description || "",
      status: "active",
    })

    await category.save()

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ProductSale, ProductSaleZodSchema } from "@/models/product-sale"
import { Product } from "@/models/product"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const sales = await ProductSale.find({ productId: params.productId })
      .populate("vendorId", "businessName email")
      .sort({ createdAt: -1 })

    return NextResponse.json({ sales })
  } catch (error) {
    console.error("Error fetching product sales:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate with Zod schema
    const validation = ProductSaleZodSchema.safeParse({
      ...body,
      saleStartingDate: new Date(body.saleStartingDate),
      saleEndingDate: new Date(body.saleEndingDate),
      vendorId: session.user.id,
      productId: params.productId,
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Check if sale ID already exists
    const existingSale = await ProductSale.findOne({ saleId: validation.data.saleId })
    if (existingSale) {
      return NextResponse.json({ error: "Sale ID already exists" }, { status: 400 })
    }

    const sale = new ProductSale(validation.data)

    await sale.save()
    await sale.populate("vendorId", "businessName email")

    return NextResponse.json({ sale })
  } catch (error) {
    console.error("Error creating product sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

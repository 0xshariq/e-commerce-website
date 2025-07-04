import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ProductSale } from "@/models/product-sale"
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
      .populate("customerId", "name email")
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

    const { customerId, quantity, salePrice, discount } = await request.json()

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const sale = new ProductSale({
      productId: params.productId,
      vendorId: session.user.id,
      customerId,
      quantity,
      salePrice,
      discount: discount || 0,
      saleDate: new Date(),
    })

    await sale.save()
    await sale.populate("customerId", "name email")

    return NextResponse.json({ sale })
  } catch (error) {
    console.error("Error creating product sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

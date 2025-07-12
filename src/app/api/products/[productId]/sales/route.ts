import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { ProductSale, ProductSaleZodSchema } from "@/models/product-sale"
import { Product } from "@/models/product"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const saleType = searchParams.get('type')
    
    // Build query
    const query: any = { productId: params.productId }
    
    if (isActive === 'true') {
      query.isActive = true
      query.saleStartingDate = { $lte: new Date() }
      query.saleEndingDate = { $gt: new Date() }
    } else if (isActive === 'false') {
      query.$or = [
        { isActive: false },
        { saleEndingDate: { $lte: new Date() } }
      ]
    }
    
    if (saleType) {
      query.saleType = saleType
    }

    const sales = await ProductSale.find(query)
      .populate("vendorId", "businessName contactPersonName email phone")
      .populate("productId", "productName imageUrl productPrice")
      .sort({ createdAt: -1 })

    // Add calculated fields
    const salesWithStats = sales.map(sale => {
      const saleObj = sale.toObject()
      return {
        ...saleObj,
        isCurrentlyActive: sale.isActiveSale(),
        remainingQuantity: sale.getRemainingQuantity(),
        daysRemaining: Math.max(0, Math.ceil((sale.saleEndingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
        totalPotentialSavings: sale.maxQuantity ? (sale.originalPrice - sale.salePrice) * sale.maxQuantity : null
      }
    })

    return NextResponse.json({ 
      sales: salesWithStats,
      totalSales: sales.length,
      activeSales: sales.filter(sale => sale.isActiveSale()).length
    })
  } catch (error) {
    console.error("Error fetching product sales:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Auto-generate sale ID if not provided
    const saleId = body.saleId || `SALE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Validate with Zod schema
    const validation = ProductSaleZodSchema.safeParse({
      ...body,
      saleId,
      saleStartingDate: new Date(body.saleStartingDate),
      saleEndingDate: new Date(body.saleEndingDate),
      vendorId: session?.user?.id,
      productId: params.productId,
      originalPrice: body.originalPrice || product.productPrice,
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    // Check if sale ID already exists
    const existingSale = await ProductSale.findOne({ saleId: validation.data.saleId })
    if (existingSale) {
      return NextResponse.json({ error: "Sale ID already exists" }, { status: 400 })
    }

    // Check for overlapping active sales
    const overlappingSale = await ProductSale.findOne({
      productId: params.productId,
      isActive: true,
      $or: [
        {
          saleStartingDate: { 
            $lte: validation.data.saleEndingDate 
          },
          saleEndingDate: { 
            $gte: validation.data.saleStartingDate 
          }
        }
      ]
    })

    if (overlappingSale) {
      return NextResponse.json({ 
        error: "Another active sale exists for this product during the selected period" 
      }, { status: 400 })
    }

    const sale = new ProductSale(validation.data)
    await sale.save()
    await sale.populate([
      { path: "vendorId", select: "businessName contactPersonName email phone" },
      { path: "productId", select: "productName imageUrl productPrice" }
    ])

    return NextResponse.json({ 
      sale: {
        ...sale.toObject(),
        isCurrentlyActive: sale.isActiveSale(),
        remainingQuantity: sale.getRemainingQuantity(),
        daysRemaining: Math.max(0, Math.ceil((sale.saleEndingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
      },
      message: "Product sale created successfully"
    })
  } catch (error) {
    console.error("Error creating product sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { saleId, ...updateData } = body

    if (!saleId) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Validate with partial Zod schema
    const validation = ProductSaleZodSchema.partial().safeParse({
      ...updateData,
      saleStartingDate: updateData.saleStartingDate ? new Date(updateData.saleStartingDate) : undefined,
      saleEndingDate: updateData.saleEndingDate ? new Date(updateData.saleEndingDate) : undefined,
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const sale = await ProductSale.findOneAndUpdate(
      {
        saleId,
        productId: params.productId,
        vendorId: session?.user?.id,
      },
      validation.data,
      { new: true, runValidators: true },
    ).populate([
      { path: "vendorId", select: "businessName contactPersonName email phone" },
      { path: "productId", select: "productName imageUrl productPrice" }
    ])

    if (!sale) {
      return NextResponse.json({ error: "Sale not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ 
      sale: {
        ...sale.toObject(),
        isCurrentlyActive: sale.isActiveSale(),
        remainingQuantity: sale.getRemainingQuantity(),
        daysRemaining: Math.max(0, Math.ceil((sale.saleEndingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
      },
      message: "Product sale updated successfully"
    })
  } catch (error) {
    console.error("Error updating product sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const saleId = searchParams.get('saleId')

    if (!saleId) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const sale = await ProductSale.findOneAndDelete({
      saleId,
      productId: params.productId,
      vendorId: session?.user?.id,
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Product sale deleted successfully",
      deletedSale: sale
    })
  } catch (error) {
    console.error("Error deleting product sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

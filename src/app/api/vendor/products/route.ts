import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Product } from "@/models/product"
import { Category } from "@/models/category"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""

    await connectDB()

    const query: any = { vendorId: session.user.id }

    if (search) {
      query.productName = { $regex: search, $options: "i" }
    }

    if (category) {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query).populate("category", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching vendor products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      productName,
      productPrice,
      imageUrl,
      category,
      description,
      stockQuantity,
      specifications,
      tags,
      weight,
      dimensions,
    } = body

    if (!productName || !productPrice || !imageUrl || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    // Verify category exists
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const product = new Product({
      productName,
      productPrice: Number(productPrice),
      imageUrl,
      category,
      description,
      vendorId: session.user.id,
      stockQuantity: stockQuantity || 0,
      specifications: specifications || {},
      tags: tags || [],
      weight: weight || 0,
      dimensions: dimensions || {},
      status: "active",
    })

    await product.save()
    await product.populate("category", "name")

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productIds, updateData } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs are required" }, { status: 400 })
    }

    await connectDB()

    const result = await Product.updateMany(
      {
        _id: { $in: productIds },
        vendorId: session.user.id,
      },
      updateData,
      { runValidators: true },
    )

    return NextResponse.json({
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error bulk updating products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get("ids")?.split(",") || []

    if (productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs are required" }, { status: 400 })
    }

    await connectDB()

    const result = await Product.deleteMany({
      _id: { $in: productIds },
      vendorId: session.user.id,
    })

    return NextResponse.json({
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error bulk deleting products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, field, value } = body

    if (!productId || !field) {
      return NextResponse.json({ error: "Product ID and field are required" }, { status: 400 })
    }

    await connectDB()

    const updateData = { [field]: value }
    const product = await Product.findOneAndUpdate({ _id: productId, vendorId: session.user.id }, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error patching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function GET_PRODUCT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id }).populate("category", "name")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { Product, ProductZodSchema } from "@/models/product"
import { Category } from "@/models/category"
import { ProductReview } from "@/models/product-review"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "999999")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const rating = Number.parseFloat(searchParams.get("rating") || "0")

    await connectDB()

    const query: any = { status: "active" }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (category) {
      query.category = category
    }

    if (minPrice > 0 || maxPrice < 999999) {
      query.productPrice = { $gte: minPrice, $lte: maxPrice }
    }

    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const [products, total, categories] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("vendorId", "businessName")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
      Category.find({ isActive: true }).select("name description"),
    ])

    // Get ratings for products if rating filter is applied
    let filteredProducts = products
    if (rating > 0) {
      const productIds = products.map((p) => p._id)
      const reviews = await ProductReview.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: "$productId", avgRating: { $avg: "$rating" } } },
      ])

      const ratingMap = new Map(reviews.map((r) => [r._id.toString(), r.avgRating]))
      filteredProducts = products.filter((p) => {
        const avgRating = ratingMap.get(p._id.toString()) || 0
        return avgRating >= rating
      })
    }

    return NextResponse.json({
      products: filteredProducts,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        search,
        category,
        minPrice,
        maxPrice,
        rating,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
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

    // Validate with Zod schema
    const validation = ProductZodSchema.safeParse({
      ...body,
      vendorId: session.user.id,
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    await connectDB()

    // Verify category exists
    const categoryExists = await Category.findById(validation.data.category)
    if (!categoryExists) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const product = new Product(validation.data)
    await product.save()
    await product.populate("category", "name")

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT() {
  try {
    // Bulk operations for admin
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  } catch (error) {
    console.error("Error in products PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Bulk delete for admin
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  } catch (error) {
    console.error("Error in products DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    // Bulk update for admin
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  } catch (error) {
    console.error("Error in products PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

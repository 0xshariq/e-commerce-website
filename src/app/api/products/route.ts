import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { Product, ProductZodSchema, PRODUCT_CATEGORIES } from "@/models/product"
import { ProductReview } from "@/models/product-review"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const subcategory = searchParams.get("subcategory") || ""
    const brand = searchParams.get("brand") || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "999999")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const rating = Number.parseFloat(searchParams.get("rating") || "0")
    const inStock = searchParams.get("inStock") === "true"
    const featured = searchParams.get("featured") === "true"

    await connectDB()

    const query: any = { 
      status: { $in: ["active"] },
      isPublished: true 
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productDescription: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { brand: { $regex: search, $options: "i" } },
      ]
    }

    if (category) {
      query.category = category
    }

    if (subcategory) {
      query.subcategory = { $regex: subcategory, $options: "i" }
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" }
    }

    if (minPrice > 0 || maxPrice < 999999) {
      query.productPrice = { $gte: minPrice, $lte: maxPrice }
    }

    if (rating > 0) {
      query.rating = { $gte: rating }
    }

    if (inStock) {
      query.stockQuantity = { $gt: 0 }
    }

    if (featured) {
      query.isFeatured = true
    }

    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Get aggregated data for filters
    const [products, total, categoryStats, brandStats] = await Promise.all([
      Product.find(query)
        .populate("vendorId", "businessName")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
      // Get category statistics
      Product.aggregate([
        { $match: { status: 'active', isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      // Get brand statistics
      Product.aggregate([
        { $match: { status: 'active', isPublished: true, brand: { $exists: true, $ne: '' } } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])
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
      categories: PRODUCT_CATEGORIES,
      categoryStats: categoryStats.map(stat => ({
        category: stat._id,
        count: stat.count
      })),
      brandStats: brandStats.map(stat => ({
        brand: stat._id,
        count: stat.count
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        search,
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        rating,
        inStock,
        featured,
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

    // Basic validation
    if (!body.productName || !body.productPrice || !body.imageUrl || !body.category || !body.stockQuantity) {
      return NextResponse.json({ 
        error: "Missing required fields: productName, productPrice, imageUrl, category, stockQuantity" 
      }, { status: 400 })
    }

    // Validate price
    if (isNaN(body.productPrice) || body.productPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    // Validate stock quantity
    if (isNaN(body.stockQuantity) || body.stockQuantity < 0) {
      return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 })
    }

    // Validate category
    if (!PRODUCT_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: "Invalid category", 
        availableCategories: PRODUCT_CATEGORIES 
      }, { status: 400 })
    }

    await connectDB()

    // Prepare product data
    const productData = {
      productName: body.productName.trim(),
      productDescription: body.productDescription?.trim() || "",
      productPrice: Number.parseFloat(body.productPrice),
      originalPrice: body.originalPrice ? Number.parseFloat(body.originalPrice) : undefined,
      discountPercentage: body.discountPercentage ? Number.parseFloat(body.discountPercentage) : undefined,
      imageUrl: body.imageUrl.trim(),
      images: body.images || [],
      category: body.category,
      subcategory: body.subcategory?.trim() || "",
      brand: body.brand?.trim() || "",
      sku: body.sku?.trim() || "",
      stockQuantity: Number.parseInt(body.stockQuantity),
      minStockLevel: body.minStockLevel ? Number.parseInt(body.minStockLevel) : 5,
      weight: body.weight ? Number.parseFloat(body.weight) : undefined,
      dimensions: body.dimensions || undefined,
      tags: body.tags || [body.productName],
      specifications: body.specifications || {},
      status: body.status || "draft",
      isPublished: body.isPublished || false,
      isFeatured: body.isFeatured || false,
      seoTitle: body.seoTitle?.trim() || "",
      seoDescription: body.seoDescription?.trim() || "",
      seoKeywords: body.seoKeywords || [],
      vendorId: session.user.id,
    }

    // Validate with Zod schema
    const validation = ProductZodSchema.safeParse(productData)

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const product = new Product(validation.data)
    await product.save()
    await product.populate("vendorId", "businessName")

    return NextResponse.json({ 
      product,
      message: "Product created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
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

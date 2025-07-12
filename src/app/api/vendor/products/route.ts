import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Product, ProductZodSchema, PRODUCT_CATEGORIES } from "@/models/product"
import { ProductSale } from "@/models/product-sale"
import { ProductReview } from "@/models/product-review"
import { Order } from "@/models/order"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const brand = searchParams.get("brand") || ""

    await connectDB()

    const query: any = { vendorId: session.user.id }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productDescription: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ]
    }

    if (category && PRODUCT_CATEGORIES.includes(category)) {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" }
    }

    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const [products, total, totalValue, lowStockCount] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Product.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: { $multiply: ["$productPrice", "$stockQuantity"] } } } }
      ]),
      Product.countDocuments({
        ...query,
        $expr: { $lte: ["$stockQuantity", "$minStockLevel"] }
      })
    ])

    // Get analytics for each product
    const productIds = products.map(p => p._id)
    const [sales, reviews, orders] = await Promise.all([
      ProductSale.find({ productId: { $in: productIds }, isActive: true }),
      ProductReview.aggregate([
        { $match: { productId: { $in: productIds } } },
        { 
          $group: { 
            _id: "$productId", 
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 }
          } 
        }
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.productId": { $in: productIds.map(id => id.toString()) } } },
        { 
          $group: { 
            _id: "$items.productId", 
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          } 
        }
      ])
    ])

    // Create lookup maps
    const salesMap = new Map(sales.map(s => [s.productId.toString(), s]))
    const reviewsMap = new Map(reviews.map(r => [r._id.toString(), r]))
    const ordersMap = new Map(orders.map(o => [o._id, o]))

    // Enhance products with analytics
    const enhancedProducts = products.map(product => {
      const productId = product._id.toString()
      const sale = salesMap.get(productId)
      const reviewData = reviewsMap.get(productId)
      const orderData = ordersMap.get(productId)

      return {
        ...product,
        analytics: {
          averageRating: reviewData?.averageRating || 0,
          totalReviews: reviewData?.totalReviews || 0,
          totalSold: orderData?.totalSold || 0,
          totalRevenue: orderData?.totalRevenue || 0,
          hasActiveSale: !!sale,
          saleInfo: sale ? {
            discountType: sale.discountType,
            discountValue: sale.discountValue,
            salePrice: sale.salePrice,
            saleEndingDate: sale.saleEndingDate
          } : null
        },
        stockStatus: product.stockQuantity <= 0 ? 'out-of-stock' 
          : product.stockQuantity <= (product.minStockLevel || 5) ? 'low-stock' 
          : 'in-stock'
      }
    })

    // Calculate summary statistics
    const categoryStats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusStats = products.reduce((acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      products: enhancedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalProducts: total,
        totalValue: totalValue[0]?.total || 0,
        lowStockCount,
        categoryStats,
        statusStats,
        availableCategories: PRODUCT_CATEGORIES
      }
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

    // Validate with Zod schema
    const validation = ProductZodSchema.safeParse({
      ...body,
      vendorId: session.user.id
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    await connectDB()

    // Verify category is valid
    if (!PRODUCT_CATEGORIES.includes(validation.data.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Generate SKU if not provided
    if (!validation.data.sku) {
      const timestamp = Date.now().toString().slice(-6)
      const productNameCode = validation.data.productName.substring(0, 3).toUpperCase()
      validation.data.sku = `${productNameCode}-${timestamp}`
    }

    // Set default values
    const productData = {
      ...validation.data,
      vendorId: session.user.id,
      status: validation.data.status || "draft",
      isPublished: validation.data.isPublished || false,
      stockQuantity: validation.data.stockQuantity || 0,
      minStockLevel: validation.data.minStockLevel || 5,
      tags: validation.data.tags || [],
      specifications: validation.data.specifications || {},
      seoKeywords: validation.data.seoKeywords || []
    }

    const product = new Product(productData)
    await product.save()

    // Populate vendor information
    await product.populate("vendorId", "businessName shopAddress email phone")

    return NextResponse.json({ 
      message: "Product created successfully",
      product 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    
    // Handle duplicate SKU error
    if (error.code === 11000 && error.keyPattern?.sku) {
      return NextResponse.json({ error: "SKU already exists. Please use a different SKU." }, { status: 400 })
    }
    
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

    // Validate update data
    const allowedBulkFields = [
      'status', 'isPublished', 'isFeatured', 'category', 
      'stockQuantity', 'minStockLevel', 'productPrice'
    ]
    
    const invalidFields = Object.keys(updateData).filter(field => !allowedBulkFields.includes(field))
    if (invalidFields.length > 0) {
      return NextResponse.json({ 
        error: `Invalid fields for bulk update: ${invalidFields.join(', ')}` 
      }, { status: 400 })
    }

    await connectDB()

    const result = await Product.updateMany(
      {
        _id: { $in: productIds },
        vendorId: session.user.id,
      },
      { ...updateData, updatedAt: new Date() },
      { runValidators: true },
    )

    return NextResponse.json({
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
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

    // First check if all products belong to this vendor
    const products = await Product.find({
      _id: { $in: productIds },
      vendorId: session.user.id,
    }).select('_id productName')

    if (products.length !== productIds.length) {
      return NextResponse.json({ 
        error: "Some products not found or unauthorized" 
      }, { status: 404 })
    }

    // Delete the products
    const result = await Product.deleteMany({
      _id: { $in: productIds },
      vendorId: session.user.id,
    })

    // Also clean up related data
    await Promise.all([
      ProductSale.deleteMany({ productId: { $in: productIds } }),
      ProductReview.deleteMany({ productId: { $in: productIds } })
    ])

    return NextResponse.json({
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
      deletedProducts: products.map(p => ({ id: p._id, name: p.productName }))
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

    // Validate allowed fields for patch updates
    const allowedFields = [
      'status', 'isPublished', 'stockQuantity', 'productPrice', 
      'isFeatured', 'minStockLevel', 'originalPrice', 'discountPercentage'
    ]
    
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ 
        error: `Field '${field}' cannot be updated via PATCH. Use PUT for full updates.` 
      }, { status: 400 })
    }

    await connectDB()

    const updateData = { [field]: value, updatedAt: new Date() }
    const product = await Product.findOneAndUpdate(
      { _id: productId, vendorId: session.user.id }, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    ).populate("vendorId", "businessName")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: `Product ${field} updated successfully`,
      product 
    })
  } catch (error) {
    console.error("Error patching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
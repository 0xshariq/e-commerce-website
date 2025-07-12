import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { Product, ProductZodSchema } from "@/models/product"
import { ProductReview } from "@/models/product-review"
import { ProductSale } from "@/models/product-sale"
import { Order } from "@/models/order"
import { Wishlist } from "@/models/wishlist"
import { Customer } from "@/models/customer"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    await connectDB()

    const product = await Product.findById(params.productId)
      .populate("vendorId", "businessName shopAddress email phone contactPersonName")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get active sales for this product
    const activeSales = await ProductSale.find({
      productId: params.productId,
      isActive: true,
      saleStartingDate: { $lte: new Date() },
      saleEndingDate: { $gt: new Date() }
    })

    const [reviews, totalOrders, relatedProducts, totalReviews] = await Promise.all([
      ProductReview.find({ productId: params.productId })
        .populate("customerId", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(10),
      Order.countDocuments({ 
        "items.productId": params.productId,
        status: { $in: ["completed", "delivered"] }
      }),
      Product.find({
        category: product.category,
        _id: { $ne: params.productId },
        status: "active",
        isPublished: true
      })
        .populate("vendorId", "businessName")
        .limit(6),
      ProductReview.countDocuments({ productId: params.productId })
    ])

    // Calculate review statistics
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0
    
    reviews.forEach(review => {
      ratingCounts[review.rating as keyof typeof ratingCounts]++
      totalRating += review.rating
    })

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

    // Check if user has this in wishlist
    const session = await getServerSession(authOptions)
    let isInWishlist = false
    let userReview = null
    
    if (session?.user?.role === "customer") {
      const [wishlistItem, existingReview] = await Promise.all([
        Wishlist.findOne({
          customerId: session.user.id,
          productId: params.productId,
        }),
        ProductReview.findOne({
          customerId: session.user.id,
          productId: params.productId,
        })
      ])
      
      isInWishlist = !!wishlistItem
      userReview = existingReview
    }

    // Determine current pricing (consider active sales)
    let currentPrice = product.productPrice
    let saleInfo = null
    
    if (activeSales.length > 0) {
      // Get the best sale (highest discount)
      const bestSale = activeSales.reduce((best, current) => {
        const bestDiscount = best.discountType === 'percentage' 
          ? (product.productPrice * best.discountValue / 100)
          : best.discountValue
        const currentDiscount = current.discountType === 'percentage'
          ? (product.productPrice * current.discountValue / 100)
          : current.discountValue
        return currentDiscount > bestDiscount ? current : best
      })
      
      currentPrice = bestSale.salePrice
      saleInfo = {
        id: bestSale._id,
        title: bestSale.saleTitle,
        discountType: bestSale.discountType,
        discountValue: bestSale.discountValue,
        originalPrice: product.productPrice,
        salePrice: bestSale.salePrice,
        saleEndingDate: bestSale.saleEndingDate,
        saleType: bestSale.saleType,
        remainingQuantity: bestSale.getRemainingQuantity()
      }
    }

    // Calculate stock status
    const stockStatus = product.stockQuantity <= 0 ? 'out-of-stock' 
      : product.stockQuantity <= (product.minStockLevel || 5) ? 'low-stock' 
      : 'in-stock'

    return NextResponse.json({
      product: {
        ...product.toObject(),
        currentPrice,
        stockStatus,
        saleInfo
      },
      reviews,
      relatedProducts,
      analytics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingCounts,
        totalOrders,
        isInWishlist,
        userReview: userReview ? {
          id: userReview._id,
          rating: userReview.rating,
          comment: userReview.comment,
          createdAt: userReview.createdAt
        } : null
      },
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    await connectDB()

    switch (action) {
      case "add_to_wishlist":
        if (session.user.role !== "customer") {
          return NextResponse.json({ error: "Only customers can add to wishlist" }, { status: 403 })
        }

        const existingWishlistItem = await Wishlist.findOne({
          customerId: session.user.id,
          productId: params.productId,
        })

        if (existingWishlistItem) {
          return NextResponse.json({ error: "Already in wishlist" }, { status: 400 })
        }

        const wishlistItem = new Wishlist({
          customerId: session.user.id,
          productId: params.productId,
        })
        await wishlistItem.save()

        return NextResponse.json({ message: "Added to wishlist", wishlistItem })

      case "remove_from_wishlist":
        if (session.user.role !== "customer") {
          return NextResponse.json({ error: "Only customers can remove from wishlist" }, { status: 403 })
        }

        await Wishlist.findOneAndDelete({
          customerId: session.user.id,
          productId: params.productId,
        })

        return NextResponse.json({ message: "Removed from wishlist" })

      case "add_review":
        if (session.user.role !== "customer") {
          return NextResponse.json({ error: "Only customers can add reviews" }, { status: 403 })
        }

        const { rating, comment } = body
        if (!rating || rating < 1 || rating > 5) {
          return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
        }

        // Check if customer has purchased this product
        const hasPurchased = await Order.findOne({
          customerId: session.user.id,
          "items.productId": params.productId,
          status: "delivered",
        })

        if (!hasPurchased) {
          return NextResponse.json({ error: "You can only review purchased products" }, { status: 403 })
        }

        // Check if already reviewed
        const existingReview = await ProductReview.findOne({
          customerId: session.user.id,
          productId: params.productId,
        })

        if (existingReview) {
          return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
        }

        const review = new ProductReview({
          productId: params.productId,
          customerId: session.user.id,
          rating,
          comment: comment || "",
          reviewDate: new Date(),
        })
        await review.save()
        await review.populate("customerId", "firstName lastName")

        return NextResponse.json({ message: "Review added successfully", review })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in product action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate with Zod schema
    const validation = ProductZodSchema.partial().safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findOneAndUpdate(
      { _id: params.productId, vendorId: session.user.id },
      validation.data,
      { new: true, runValidators: true },
    ).populate("vendorId", "businessName")

    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Product updated successfully",
      product 
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "vendor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const query =
      session.user.role === "vendor" ? { _id: params.productId, vendorId: session.user.id } : { _id: params.productId }

    const product = await Product.findOneAndDelete(query)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { field, value } = body

    if (!field) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 })
    }

    // Validate allowed fields for patch updates
    const allowedFields = ['status', 'isPublished', 'stockQuantity', 'productPrice', 'isFeatured']
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ 
        error: `Field '${field}' cannot be updated via PATCH. Use PUT for full updates.` 
      }, { status: 400 })
    }

    await connectDB()

    const updateData = { [field]: value, updatedAt: new Date() }
    const product = await Product.findOneAndUpdate(
      { _id: params.productId, vendorId: session.user.id }, 
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

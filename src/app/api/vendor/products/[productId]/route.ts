import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Product } from "@/models/product"
import { Order } from "@/models/order"
import { ProductReview } from "@/models/product-review"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const product = await Product.findOne({
      _id: params.productId,
      vendorId: session.user.id,
    }).populate("category", "name description")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get additional product analytics
    const [orders, reviews] = await Promise.all([
      Order.find({ productId: params.productId }).countDocuments(),
      ProductReview.find({ productId: params.productId }),
    ])

    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    return NextResponse.json({
      product,
      analytics: {
        totalOrders: orders,
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    })
  } catch (error) {
    console.error("Error fetching product:", error)
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

    await connectDB()

    const product = await Product.findOneAndUpdate(
      { _id: params.productId, vendorId: session.user.id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("category", "name")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Check if product has any orders
    const hasOrders = await Order.findOne({ productId: params.productId })
    if (hasOrders) {
      // Soft delete - mark as inactive instead of deleting
      const product = await Product.findOneAndUpdate(
        { _id: params.productId, vendorId: session.user.id },
        { status: "inactive", deletedAt: new Date() },
        { new: true },
      )

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      return NextResponse.json({
        message: "Product marked as inactive due to existing orders",
        product,
      })
    }

    const product = await Product.findOneAndDelete({
      _id: params.productId,
      vendorId: session.user.id,
    })

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

    await connectDB()

    const updateData = { [field]: value, updatedAt: new Date() }
    const product = await Product.findOneAndUpdate({ _id: params.productId, vendorId: session.user.id }, updateData, {
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

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    await connectDB()

    const product = await Product.findOne({
      _id: params.productId,
      vendorId: session.user.id,
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    switch (action) {
      case "duplicate":
        const duplicatedProduct = new Product({
          ...product.toObject(),
          _id: undefined,
          productName: `${product.productName} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        await duplicatedProduct.save()
        await duplicatedProduct.populate("category", "name")
        return NextResponse.json({ product: duplicatedProduct })

      case "toggle_status":
        product.status = product.status === "active" ? "inactive" : "active"
        await product.save()
        return NextResponse.json({ product })

      case "update_stock":
        const { stockQuantity } = body
        if (typeof stockQuantity !== "number") {
          return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 })
        }
        product.stockQuantity = stockQuantity
        await product.save()
        return NextResponse.json({ product })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing product action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

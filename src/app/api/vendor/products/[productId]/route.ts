import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Product, ProductUpdateZodSchema } from "@/models/product"
import { Order } from "@/models/order"
import { ProductReview } from "@/models/product-review"
import { uploadProductImage, deleteImage, getImageUrl } from "@/utils/upload"

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
    }).populate("vendorId", "businessName")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get additional product analytics
    const [orders, reviews] = await Promise.all([
      Order.find({ 
        "items.productId": params.productId 
      }).countDocuments(),
      ProductReview.find({ productId: params.productId }),
    ])

    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    // Get image URL with fallback
    const imageUrl = await getImageUrl('product', params.productId)

    return NextResponse.json({
      product: {
        ...product.toObject(),
        imageUrl: imageUrl || product.imageUrl
      },
      analytics: {
        totalOrders: orders,
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        inStock: product.stockQuantity > 0,
        lowStock: product.stockQuantity <= (product.minStockLevel || 5),
        totalSales: product.totalSales || 0,
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

    // Validate the update data
    const validation = ProductUpdateZodSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const product = await Product.findOneAndUpdate(
      { _id: params.productId, vendorId: session.user.id },
      { ...validation.data, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("vendorId", "businessName")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get updated image URL with fallback
    const imageUrl = await getImageUrl('product', params.productId)

    return NextResponse.json({ 
      product: {
        ...product.toObject(),
        imageUrl: imageUrl || product.imageUrl
      },
      message: "Product updated successfully"
    })
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
    const hasOrders = await Order.findOne({ 
      "items.productId": params.productId 
    })
    
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

    // Delete associated images
    await deleteImage('product', params.productId)

    return NextResponse.json({ 
      message: "Product deleted successfully" 
    })
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

    // Get updated image URL with fallback
    const imageUrl = await getImageUrl('product', params.productId)

    return NextResponse.json({ 
      product: {
        ...product.toObject(),
        imageUrl: imageUrl || product.imageUrl
      },
      message: `${field} updated successfully`
    })
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
          sku: undefined, // Let it generate a new SKU
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        await duplicatedProduct.save()
        await duplicatedProduct.populate("vendorId", "businessName")
        
        // Get image URL for the duplicated product
        const duplicatedImageUrl = await getImageUrl('product', duplicatedProduct._id.toString())
        
        return NextResponse.json({ 
          product: {
            ...duplicatedProduct.toObject(),
            imageUrl: duplicatedImageUrl || duplicatedProduct.imageUrl
          },
          message: "Product duplicated successfully"
        })

      case "toggle_status":
        product.status = product.status === "active" ? "inactive" : "active"
        await product.save()
        
        const toggledImageUrl = await getImageUrl('product', params.productId)
        
        return NextResponse.json({ 
          product: {
            ...product.toObject(),
            imageUrl: toggledImageUrl || product.imageUrl
          },
          message: `Product ${product.status === "active" ? "activated" : "deactivated"} successfully`
        })

      case "update_stock":
        const { stockQuantity } = body
        if (typeof stockQuantity !== "number" || stockQuantity < 0) {
          return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 })
        }
        product.stockQuantity = stockQuantity
        await product.save()
        
        const stockImageUrl = await getImageUrl('product', params.productId)
        
        return NextResponse.json({ 
          product: {
            ...product.toObject(),
            imageUrl: stockImageUrl || product.imageUrl
          },
          message: "Stock quantity updated successfully"
        })

      case "upload_image":
        const formData = await request.formData()
        const imageFile = formData.get('image') as File
        
        if (!imageFile) {
          return NextResponse.json({ error: "No image file provided" }, { status: 400 })
        }

        const uploadResult = await uploadProductImage(imageFile, params.productId)
        
        if (!uploadResult.success) {
          return NextResponse.json({ error: uploadResult.message }, { status: 400 })
        }

        // Update product image URL
        product.imageUrl = uploadResult.cloudinaryUrl || uploadResult.publicUrl || product.imageUrl
        await product.save()
        
        return NextResponse.json({ 
          product: {
            ...product.toObject(),
            imageUrl: uploadResult.cloudinaryUrl || uploadResult.publicUrl
          },
          message: "Product image updated successfully"
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing product action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

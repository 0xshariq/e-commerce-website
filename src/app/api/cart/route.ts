import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Cart } from "@/models/cart"
import { Product } from "@/models/product"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const cartItems = await Cart.find({ customerId: session.user.id })
      .populate({
        path: "productId",
        select: "productName productPrice imageUrl vendorId stockQuantity status",
        populate: {
          path: "vendorId",
          select: "businessName shopAddress",
        },
      })
      .sort({ createdAt: -1 })

    // Filter out items where product is inactive or out of stock
    const activeCartItems = cartItems.filter(
      (item) => item.productId && item.productId.status === "active" && item.productId.stockQuantity > 0,
    )

    const totalAmount = activeCartItems.reduce((sum, item) => sum + item.productId.productPrice * item.quantity, 0)

    const totalItems = activeCartItems.reduce((sum, item) => sum + item.quantity, 0)

    // Group by vendor for better organization
    const groupedByVendor = activeCartItems.reduce((acc, item) => {
      const vendorId = item.productId.vendorId._id.toString()
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: item.productId.vendorId,
          items: [],
          subtotal: 0,
        }
      }
      acc[vendorId].items.push(item)
      acc[vendorId].subtotal += item.productId.productPrice * item.quantity
      return acc
    }, {})

    return NextResponse.json({
      cartItems: activeCartItems,
      groupedByVendor: Object.values(groupedByVendor),
      summary: {
        totalAmount,
        totalItems,
        itemCount: activeCartItems.length,
      },
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    await connectDB()

    // Check if product exists and is available
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.status !== "active") {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 })
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const existingItem = await Cart.findOne({
      customerId: session.user.id,
      productId,
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (product.stockQuantity < newQuantity) {
        return NextResponse.json({ error: "Insufficient stock for requested quantity" }, { status: 400 })
      }

      existingItem.quantity = newQuantity
      existingItem.updatedAt = new Date()
      await existingItem.save()
      await existingItem.populate("productId", "productName productPrice imageUrl")

      return NextResponse.json({ cartItem: existingItem })
    }

    const cartItem = new Cart({
      customerId: session.user.id,
      productId,
      quantity,
    })

    await cartItem.save()
    await cartItem.populate("productId", "productName productPrice imageUrl")

    return NextResponse.json({ cartItem }, { status: 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items } = await request.json()

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 })
    }

    await connectDB()

    const updatePromises = items.map(async ({ cartId, quantity }) => {
      if (quantity < 1) {
        return Cart.findOneAndDelete({ _id: cartId, customerId: session.user.id })
      }

      return Cart.findOneAndUpdate(
        { _id: cartId, customerId: session.user.id },
        { quantity, updatedAt: new Date() },
        { new: true },
      ).populate("productId", "productName productPrice imageUrl")
    })

    const results = await Promise.all(updatePromises)

    return NextResponse.json({
      message: "Cart updated successfully",
      updatedItems: results.filter(Boolean),
    })
  } catch (error) {
    console.error("Error bulk updating cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    await connectDB()

    if (action === "clear") {
      // Clear entire cart
      const result = await Cart.deleteMany({ customerId: session.user.id })
      return NextResponse.json({
        message: "Cart cleared successfully",
        deletedCount: result.deletedCount,
      })
    }

    const itemIds = searchParams.get("items")?.split(",") || []
    if (itemIds.length === 0) {
      return NextResponse.json({ error: "No items specified" }, { status: 400 })
    }

    const result = await Cart.deleteMany({
      _id: { $in: itemIds },
      customerId: session.user.id,
    })

    return NextResponse.json({
      message: `${result.deletedCount} items removed from cart`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting cart items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, productIds } = await request.json()

    await connectDB()

    switch (action) {
      case "save_for_later":
        await Cart.updateMany(
          {
            customerId: session.user.id,
            productId: { $in: productIds },
          },
          { savedForLater: true },
        )
        return NextResponse.json({ message: "Items saved for later" })

      case "move_to_cart":
        await Cart.updateMany(
          {
            customerId: session.user.id,
            productId: { $in: productIds },
          },
          { savedForLater: false },
        )
        return NextResponse.json({ message: "Items moved to cart" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error patching cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function POST_BULK_DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productIds } = await request.json()

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs are required" }, { status: 400 })
    }

    await connectDB()

    const result = await Cart.deleteMany({
      customerId: session.user.id,
      productId: { $in: productIds },
    })

    return NextResponse.json({
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error bulk deleting cart items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

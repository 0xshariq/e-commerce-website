import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Cart } from "@/models/cart"
import { Product } from "@/models/product"

export async function GET(request: NextRequest, { params }: { params: { cartId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const cartItem = await Cart.findOne({
      _id: params.cartId,
      customerId: session.user.id,
    }).populate({
      path: "productId",
      select: "productName productPrice imageUrl vendorId stockQuantity status",
      populate: {
        path: "vendorId",
        select: "businessName shopAddress",
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error("Error fetching cart item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { cartId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    await connectDB()

    const cartItem = await Cart.findOne({
      _id: params.cartId,
      customerId: session.user.id,
    }).populate("productId", "stockQuantity status")

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Check product availability
    if (cartItem.productId.status !== "active") {
      return NextResponse.json({ error: "Product is no longer available" }, { status: 400 })
    }

    if (cartItem.productId.stockQuantity < quantity) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          availableStock: cartItem.productId.stockQuantity,
        },
        { status: 400 },
      )
    }

    cartItem.quantity = quantity
    cartItem.updatedAt = new Date()
    await cartItem.save()

    await cartItem.populate("productId", "productName productPrice imageUrl")

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { cartId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const cartItem = await Cart.findOneAndDelete({
      _id: params.cartId,
      customerId: session.user.id,
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { cartId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    await connectDB()

    const cartItem = await Cart.findOne({
      _id: params.cartId,
      customerId: session.user.id,
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    switch (action) {
      case "save_for_later":
        cartItem.savedForLater = true
        await cartItem.save()
        return NextResponse.json({ message: "Item saved for later", cartItem })

      case "move_to_cart":
        cartItem.savedForLater = false
        await cartItem.save()
        return NextResponse.json({ message: "Item moved to cart", cartItem })

      case "increment":
        const product = await Product.findById(cartItem.productId)
        if (product && product.stockQuantity > cartItem.quantity) {
          cartItem.quantity += 1
          cartItem.updatedAt = new Date()
          await cartItem.save()
          await cartItem.populate("productId", "productName productPrice imageUrl")
          return NextResponse.json({ cartItem })
        }
        return NextResponse.json({ error: "Cannot increase quantity - insufficient stock" }, { status: 400 })

      case "decrement":
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1
          cartItem.updatedAt = new Date()
          await cartItem.save()
          await cartItem.populate("productId", "productName productPrice imageUrl")
          return NextResponse.json({ cartItem })
        }
        return NextResponse.json({ error: "Minimum quantity is 1" }, { status: 400 })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error patching cart item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { cartId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    await connectDB()

    const cartItem = await Cart.findOne({
      _id: params.cartId,
      customerId: session.user.id,
    }).populate("productId")

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    switch (action) {
      case "duplicate":
        const duplicatedItem = new Cart({
          customerId: session.user.id,
          productId: cartItem.productId._id,
          quantity: cartItem.quantity,
        })
        await duplicatedItem.save()
        await duplicatedItem.populate("productId", "productName productPrice imageUrl")
        return NextResponse.json({ cartItem: duplicatedItem })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in cart item action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  _id: string
  quantity: number
  productId: {
    _id: string
    productName: string
    productPrice: number
    imageUrl: string
    vendorId: {
      name: string
      shopAddress: string
    }
  }
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if ((session?.user as any)?.role !== "customer") {
      router.push("/")
      return
    }

    fetchCart()
  }, [session, status, router])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.cartItems || [])
        setTotalAmount(data.summary?.totalAmount || 0)
      } else {
        toast.error("Failed to fetch cart")
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast.error("Error fetching cart")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCart() // Refresh cart
      } else {
        toast.error("Failed to update quantity")
      }
    } catch (error) {
      toast.error("Error updating quantity")
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCartItems(cartItems.filter((item) => item._id !== itemId))
        toast.success("Item removed from cart")
        fetchCart() // Refresh to get updated total
      } else {
        toast.error("Failed to remove item")
      }
    } catch (error) {
      toast.error("Error removing item")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingCart className="w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-gray-600">({cartItems.length} items)</span>
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.productId.imageUrl || "/placeholder.svg"}
                        alt={item.productId.productName}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.productId._id}`}
                        className="font-semibold text-lg hover:text-blue-600 line-clamp-2"
                      >
                        {item.productId.productName}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Sold by {item.productId.vendorId?.name || 'Unknown Vendor'}
                      </p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{item.productId.productPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={updating === item._id || item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, Number.parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          disabled={updating === item._id}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={updating === item._id}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>

                      {/* Item Total */}
                      <p className="font-semibold text-lg">
                        ₹{(item.productId.productPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center">
                  <Link href="/" className="text-blue-600 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

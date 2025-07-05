"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Edit, Tag, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface Product {
  _id: string
  productName: string
  productPrice: number
  imageUrl: string
  description?: string
  category: {
    _id: string
    name: string
    description: string
  }
  vendorId: {
    _id: string
    name: string
    shopAddress: string
  }
  createdAt: string
}

interface Review {
  _id: string
  rating: number
  comment: string
  customerId: {
    name: string
  }
  createdAt: string
}

export default function ProductPage({ params }: { params: { productId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [params.productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
        setTotalReviews(data.totalReviews)
      } else {
        toast.error("Product not found")
        router.push("/")
      }
    } catch (error) {
      toast.error("Error fetching product")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "customer") {
      toast.error("Only customers can add items to cart")
      return
    }

    setAddingToCart(true)

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: params.productId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        toast.success("Added to cart successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add to cart")
      }
    } catch (error) {
      toast.error("Error adding to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  const isVendorProduct = session?.user?.role === "vendor" && session?.user?.id === product.vendorId._id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden border">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.productName}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category.name}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">{renderStars(Math.round(averageRating))}</div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-green-600">₹{product.productPrice.toLocaleString()}</span>
            </div>

            {/* Vendor Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-1">Sold by</h3>
              <p className="text-gray-700">{product.vendorId.name}</p>
              <p className="text-sm text-gray-600">{product.vendorId.shopAddress}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {isVendorProduct ? (
              <div className="flex gap-4">
                <Link href={`/vendor/products/${product._id}`} className="flex-1">
                  <Button className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                </Link>
                <Link href={`/products/${product._id}/sales`}>
                  <Button variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Sales
                  </Button>
                </Link>
                <Link href={`/products/${product._id}/coupon`}>
                  <Button variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Coupons
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button onClick={handleAddToCart} disabled={addingToCart} className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              Free Delivery
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              Easy Returns
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.customerId.name}</span>
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

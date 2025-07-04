"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Package } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface Product {
  _id: string
  productName: string
  productPrice: number
  imageUrl: string
  category: {
    _id: string
    name: string
  }
  description?: string
}

interface Category {
  _id: string
  name: string
  description: string
}

export default function EditProductPage({ params }: { params: { productId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    productName: "",
    productPrice: "",
    imageUrl: "",
    category: "",
    description: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/vendor/signin")
      return
    }

    if (session?.user?.role !== "vendor") {
      router.push("/")
      return
    }

    fetchProduct()
    fetchCategories()
  }, [session, status, router, params.productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/vendor/products/${params.productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
        setFormData({
          productName: data.product.productName,
          productPrice: data.product.productPrice.toString(),
          imageUrl: data.product.imageUrl,
          category: data.product.category._id,
          description: data.product.description || "",
        })
      } else {
        toast.error("Product not found")
        router.push("/vendor/products")
      }
    } catch (error) {
      toast.error("Error fetching product")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productName || !formData.productPrice || !formData.imageUrl || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/vendor/products/${params.productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          productPrice: Number.parseFloat(formData.productPrice),
        }),
      })

      if (response.ok) {
        toast.success("Product updated successfully!")
        router.push("/vendor/products")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update product")
      }
    } catch (error) {
      toast.error("Error updating product")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link href="/vendor/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/vendor/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update your product details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Product Image */}
            <div className="space-y-2">
              <Label>Current Product Image</Label>
              <div className="relative w-32 h-32">
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.productName}
                  fill
                  className="object-cover rounded-md border"
                />
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="productPrice">Price (₹) *</Label>
              <Input
                id="productPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.productPrice}
                onChange={(e) => handleInputChange("productPrice", e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Product Image URL *</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                required
              />
              {formData.imageUrl && formData.imageUrl !== product.imageUrl && (
                <div className="mt-2">
                  <Label className="text-sm text-gray-600">New Image Preview:</Label>
                  <img
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="New product preview"
                    className="w-32 h-32 object-cover rounded-md border mt-1"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Product
                  </>
                )}
              </Button>
              <Link href="/vendor/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

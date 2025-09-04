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
import { ArrowLeft, Save, Package, Plus, Tag, TrendingUp, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

interface Coupon {
  _id: string
  code: string
  discountType: "percentage" | "amount"
  discountValue: number
  expiryDate: string
  isActive: boolean
  description: string
  usageLimit: number
  usedCount: number
}

interface Sale {
  _id: string
  saleId: string
  saleStartingDate: string
  saleEndingDate: string
  amount: number
}

export default function EditProductPage({ params }: { params: { productId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [saleModalOpen, setSaleModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    productName: "",
    productPrice: "",
    imageUrl: "",
    category: "",
    description: "",
  })

  const [couponData, setCouponData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "amount",
    discountValue: "",
    expiryDate: "",
    description: "",
    usageLimit: "1",
    userLimit: "1",
  })

  const [saleData, setSaleData] = useState({
    saleId: "",
    saleStartingDate: "",
    saleEndingDate: "",
    amount: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if ((session?.user as { role?: string })?.role !== "vendor") {
      router.push("/")
      return
    }

    fetchProduct()
    fetchCategories()
    fetchCoupons()
    fetchSales()
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
    } catch (_error) {
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

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`/api/products/${params.productId}/coupon`)
      if (response.ok) {
        const data = await response.json()
        setCoupons(data.coupons)
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
    }
  }

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/products/${params.productId}/sales`)
      if (response.ok) {
        const data = await response.json()
        setSales(data.sales)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
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

  const handleCouponInputChange = (field: string, value: string) => {
    setCouponData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaleInputChange = (field: string, value: string) => {
    setSaleData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/products/${params.productId}/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...couponData,
          discountValue: Number.parseFloat(couponData.discountValue),
          usageLimit: Number.parseInt(couponData.usageLimit),
          userLimit: Number.parseInt(couponData.userLimit),
        }),
      })

      if (response.ok) {
        toast.success("Coupon created successfully!")
        setCouponModalOpen(false)
        fetchCoupons()
        setCouponData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          expiryDate: "",
          description: "",
          usageLimit: "1",
          userLimit: "1",
        })
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create coupon")
      }
    } catch (error) {
      toast.error("Error creating coupon")
    }
  }

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/products/${params.productId}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...saleData,
          amount: Number.parseFloat(saleData.amount),
        }),
      })

      if (response.ok) {
        toast.success("Sale created successfully!")
        setSaleModalOpen(false)
        fetchSales()
        setSaleData({
          saleId: "",
          saleStartingDate: "",
          saleEndingDate: "",
          amount: "",
        })
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create sale")
      }
    } catch (error) {
      toast.error("Error creating sale")
    }
  }

  const handleDeleteProduct = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${params.productId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast.success("Product deleted successfully!")
          router.push("/vendor/products")
        } else {
          const error = await response.json()
          toast.error(error.error || "Failed to delete product")
        }
      } catch (error) {
        toast.error("Error deleting product")
      }
    }
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
              <Button type="button" variant="destructive" onClick={handleDeleteProduct}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
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

      {/* Coupons Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Coupons
            </div>
            <Dialog open={couponModalOpen} onOpenChange={setCouponModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Coupon</DialogTitle>
                  <DialogDescription>
                    Add a discount coupon for this product
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCouponSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="couponCode">Coupon Code *</Label>
                    <Input
                      id="couponCode"
                      placeholder="SAVE10"
                      value={couponData.code}
                      onChange={(e) => handleCouponInputChange("code", e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Type *</Label>
                      <Select 
                        value={couponData.discountType} 
                        onValueChange={(value: "percentage" | "amount") => handleCouponInputChange("discountType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="amount">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">
                        Discount Value * {couponData.discountType === "percentage" ? "(%)" : "(₹)"}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        min="0"
                        max={couponData.discountType === "percentage" ? "100" : undefined}
                        placeholder="10"
                        value={couponData.discountValue}
                        onChange={(e) => handleCouponInputChange("discountValue", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="datetime-local"
                      value={couponData.expiryDate}
                      onChange={(e) => handleCouponInputChange("expiryDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="usageLimit">Usage Limit *</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={couponData.usageLimit}
                        onChange={(e) => handleCouponInputChange("usageLimit", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userLimit">Per User Limit *</Label>
                      <Input
                        id="userLimit"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={couponData.userLimit}
                        onChange={(e) => handleCouponInputChange("userLimit", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couponDescription">Description *</Label>
                    <Textarea
                      id="couponDescription"
                      placeholder="Describe the coupon offer"
                      value={couponData.description}
                      onChange={(e) => handleCouponInputChange("description", e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Coupon</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length > 0 ? (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{coupon.code}</p>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                      <p className="text-sm text-gray-500">
                        {coupon.discountType === "percentage" 
                          ? `${coupon.discountValue}% off` 
                          : `₹${coupon.discountValue} off`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Used: {coupon.usedCount}/{coupon.usageLimit}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No coupons created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Sales Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sales
            </div>
            <Dialog open={saleModalOpen} onOpenChange={setSaleModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Sale</DialogTitle>
                  <DialogDescription>
                    Set up a sale period for this product
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="saleId">Sale ID *</Label>
                    <Input
                      id="saleId"
                      placeholder="SALE2024"
                      value={saleData.saleId}
                      onChange={(e) => handleSaleInputChange("saleId", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="saleStartingDate">Start Date *</Label>
                      <Input
                        id="saleStartingDate"
                        type="datetime-local"
                        value={saleData.saleStartingDate}
                        onChange={(e) => handleSaleInputChange("saleStartingDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="saleEndingDate">End Date *</Label>
                      <Input
                        id="saleEndingDate"
                        type="datetime-local"
                        value={saleData.saleEndingDate}
                        onChange={(e) => handleSaleInputChange("saleEndingDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saleAmount">Sale Price (₹) *</Label>
                    <Input
                      id="saleAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="999.00"
                      value={saleData.amount}
                      onChange={(e) => handleSaleInputChange("amount", e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Sale</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length > 0 ? (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sale.saleId}</p>
                      <p className="text-sm text-gray-600">Sale Price: ₹{sale.amount}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(sale.saleStartingDate).toLocaleDateString()} - {new Date(sale.saleEndingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No sales created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

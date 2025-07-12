"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Package, Save, Eye, ImagePlus, Plus, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PRODUCT_CATEGORIES } from "@/models/product"

interface Product {
  _id?: string
  productName: string
  productDescription?: string
  productPrice: number
  originalPrice?: number
  discountPercentage?: number
  imageUrl: string
  images?: string[]
  category: string
  subcategory?: string
  brand?: string
  sku?: string
  stockQuantity: number
  minStockLevel?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags?: string[]
  specifications?: Record<string, any>
  status: 'active' | 'inactive' | 'draft' | 'out-of-stock'
  isPublished: boolean
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

export default function CreateProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editProductId = searchParams.get("id")
  const isEditMode = !!editProductId

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [tagInput, setTagInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [specKey, setSpecKey] = useState("")
  const [specValue, setSpecValue] = useState("")
  
  const [productData, setProductData] = useState<Product>({
    productName: "",
    productDescription: "",
    productPrice: 0,
    originalPrice: 0,
    discountPercentage: 0,
    imageUrl: "",
    images: [],
    category: "",
    subcategory: "",
    brand: "",
    sku: "",
    stockQuantity: 0,
    minStockLevel: 5,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    tags: [],
    specifications: {},
    status: "draft",
    isPublished: false,
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if ((session?.user as any)?.role !== "vendor") {
      router.push("/")
      return
    }

    if (isEditMode && editProductId) {
      fetchProductData(editProductId)
    }
  }, [session, status, router, isEditMode, editProductId])

  const fetchProductData = async (productId: string) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/api/vendor/products/${productId}`)
      if (response.data.product) {
        setProductData(response.data.product)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Failed to fetch product data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Product, value: any) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDimensionsChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    setProductData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [dimension]: value
      }
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('image', file)
      
      // For now, we'll use a placeholder URL. In real implementation,
      // you would upload to your server or cloud storage
      const imageUrl = URL.createObjectURL(file)
      
      handleInputChange('imageUrl', imageUrl)
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !productData.tags?.includes(tagInput.trim())) {
      handleInputChange('tags', [...(productData.tags || []), tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', productData.tags?.filter(tag => tag !== tagToRemove) || [])
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !productData.seoKeywords?.includes(keywordInput.trim())) {
      handleInputChange('seoKeywords', [...(productData.seoKeywords || []), keywordInput.trim()])
      setKeywordInput("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    handleInputChange('seoKeywords', productData.seoKeywords?.filter(keyword => keyword !== keywordToRemove) || [])
  }

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      handleInputChange('specifications', {
        ...productData.specifications,
        [specKey.trim()]: specValue.trim()
      })
      setSpecKey("")
      setSpecValue("")
    }
  }

  const removeSpecification = (keyToRemove: string) => {
    const newSpecs = { ...productData.specifications }
    delete newSpecs[keyToRemove]
    handleInputChange('specifications', newSpecs)
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      setIsLoading(true)

      // Validation
      if (!productData.productName.trim()) {
        toast.error("Product name is required")
        return
      }
      if (!productData.category) {
        toast.error("Category is required")
        return
      }
      if (productData.productPrice <= 0) {
        toast.error("Valid product price is required")
        return
      }
      if (productData.stockQuantity < 0) {
        toast.error("Stock quantity cannot be negative")
        return
      }

      const submitData = {
        ...productData,
        status: isDraft ? 'draft' : productData.status,
        isPublished: !isDraft && productData.isPublished
      }

      if (isEditMode) {
        await axios.put(`/api/vendor/products/${editProductId}`, submitData)
        toast.success("Product updated successfully!")
      } else {
        await axios.post("/api/products", submitData)
        toast.success("Product created successfully!")
      }

      router.push("/vendor/products")
    } catch (error: any) {
      console.error("Error saving product:", error)
      const errorMessage = error.response?.data?.error || "Failed to save product"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/vendor/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Product" : "Create New Product"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Update your product details" : "Add a new product to your inventory"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
          >
            <Package className="h-4 w-4 mr-2" />
            {isEditMode ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="seo">SEO & Marketing</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={productData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={productData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={productData.subcategory || ""}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="Enter subcategory"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={productData.brand || ""}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productData.productDescription || ""}
                  onChange={(e) => handleInputChange('productDescription', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  {productData.imageUrl && (
                    <img 
                      src={productData.imageUrl} 
                      alt="Product preview" 
                      className="h-16 w-16 object-cover rounded border"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productPrice">Selling Price *</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productData.productPrice}
                    onChange={(e) => handleInputChange('productPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productData.originalPrice || ""}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Discount %</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={productData.discountPercentage || ""}
                    onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productData.sku || ""}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productData.weight || ""}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    type="number"
                    min="0"
                    value={productData.dimensions?.length || ""}
                    onChange={(e) => handleDimensionsChange('length', parseFloat(e.target.value) || 0)}
                    placeholder="Length"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={productData.dimensions?.width || ""}
                    onChange={(e) => handleDimensionsChange('width', parseFloat(e.target.value) || 0)}
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={productData.dimensions?.height || ""}
                    onChange={(e) => handleDimensionsChange('height', parseFloat(e.target.value) || 0)}
                    placeholder="Height"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <Label>Specifications</Label>
                <div className="flex space-x-2">
                  <Input
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Specification name"
                  />
                  <Input
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="Specification value"
                  />
                  <Button type="button" onClick={addSpecification} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(productData.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span><strong>{key}:</strong> {value}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer" 
                        onClick={() => removeSpecification(key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={productData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={productData.minStockLevel || ""}
                    onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || undefined)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Product Status</Label>
                  <Select 
                    value={productData.status}
                    onValueChange={(value: any) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={productData.isPublished}
                    onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                  />
                  <Label htmlFor="isPublished">Publish Product</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={productData.isFeatured || false}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                  <Label htmlFor="isFeatured">Featured Product</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Marketing */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Marketing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={productData.seoTitle || ""}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="SEO-friendly title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground">
                  {(productData.seoTitle || "").length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={productData.seoDescription || ""}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="SEO-friendly description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  {(productData.seoDescription || "").length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <div className="flex space-x-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add SEO keyword"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productData.seoKeywords?.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

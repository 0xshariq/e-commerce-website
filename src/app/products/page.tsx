"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Star, ShoppingCart, Heart, Grid, List, Loader2 } from "lucide-react"
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
  vendorId: {
    businessName: string
    _id: string
  }
  status: string
  createdAt: string
}

interface Category {
  _id: string
  name: string
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category._id === selectedCategory
      const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.productPrice - b.productPrice)
        break
      case 'price-high':
        filtered.sort((a, b) => b.productPrice - a.productPrice)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        // Keep original order for featured
        break
    }

    return filtered
  }, [products, selectedCategory, searchQuery, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Discover amazing products from our trusted vendors</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Product Grid/List */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
          }`}>
            {filteredAndSortedProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="relative aspect-square">
                      <Image
                        src={product.imageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      {product.status !== 'active' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.category.name}
                        </Badge>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-gray-600">by {product.vendorId.businessName}</p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold text-green-600">
                            ₹{product.productPrice.toLocaleString()}
                          </span>
                          <Link href={`/products/${product._id}`}>
                            <Button size="sm" disabled={product.status !== 'active'}>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // List View
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.productName}
                          fill
                          className="object-cover rounded"
                        />
                        {product.status !== 'active' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                            <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="secondary" className="text-xs mb-1">
                              {product.category.name}
                            </Badge>
                            <h3 className="font-semibold">{product.productName}</h3>
                            <p className="text-sm text-gray-600">by {product.vendorId.businessName}</p>
                            {product.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="flex-shrink-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">
                            ₹{product.productPrice.toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/products/${product._id}`}>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </Link>
                            <Button size="sm" disabled={product.status !== 'active'}>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Shop With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">{products.length}+</div>
                <div className="text-gray-600">Products Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{categories.length}+</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">50k+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
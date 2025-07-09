"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  _id: string
  productName: string
  productPrice: number
  imageUrl: string
  status: string
  category: {
    _id: string
    name: string
  }
}

export default function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/vendor/products")
      if (response.ok) {
        const data = await response.json()
        setProducts((data.products || []).slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/2 mt-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Products
        </CardTitle>
        <Link href="/vendor/products">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="text-white font-medium text-sm">{product.productName}</p>
                    <p className="text-gray-400 text-xs">{product.category?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">₹{product.productPrice}</p>
                  <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-xs">
                    {product.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No products yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

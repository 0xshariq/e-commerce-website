"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Eye } from "lucide-react"
import { formatCurrency } from "@/utils/formatting"

interface RecommendationsProps {
  recommendations: Array<{
    id: number
    name: string
    price: number
    originalPrice: number
    rating: number
    reviews: number
    image: string
  }>
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Recommended for You</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Based on your purchase history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No recommendations yet</p>
            <p className="text-xs text-gray-500">Shop more to get personalized recommendations</p>
          </div>
        ) : (
          recommendations.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700/50 cursor-pointer"
              onClick={() => (window.location.href = `/products/${product.id}`)}
            >
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/200x200?text=Product";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm sm:text-base truncate">{product.name}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  {product.rating} ({product.reviews} reviews)
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">₹{product.price}</div>
                {product.originalPrice > product.price && (
                  <div className="text-xs text-gray-400 line-through">₹{product.originalPrice}</div>
                )}
              </div>
            </div>
          ))
        )}

        {recommendations.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              className="text-xs border-gray-700 text-gray-300 hover:bg-gray-700"
              onClick={() => (window.location.href = "/products")}
            >
              <Eye className="h-3 w-3 mr-1" />
              Explore More Products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

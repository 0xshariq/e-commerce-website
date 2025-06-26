import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Premium Laptop",
    price: 1299,
    originalPrice: 1599,
    rating: 4.5,
    reviews: 128,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smartphone Pro",
    price: 899,
    originalPrice: 999,
    rating: 4.8,
    reviews: 256,
    image: "/placeholder.svg?height=300&width=300",
    badge: "New",
  },
  {
    id: 3,
    name: "Gaming Console",
    price: 499,
    originalPrice: 599,
    rating: 4.7,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Hot",
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    price: 199,
    originalPrice: 249,
    rating: 4.3,
    reviews: 342,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Sale",
  },
  {
    id: 5,
    name: 'Smart TV 55"',
    price: 799,
    originalPrice: 999,
    rating: 4.6,
    reviews: 167,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Deal",
  },
  {
    id: 6,
    name: "Fitness Tracker",
    price: 149,
    originalPrice: 199,
    rating: 4.4,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=300",
    badge: "Popular",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-white">Featured Products</h2>
          <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
            View All Products
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-gray-700 border-gray-600 overflow-hidden group hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-orange-600 text-white">{product.badge}</Badge>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="bg-white/20 hover:bg-white/40 text-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-orange-400">${product.price}</span>
                  <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

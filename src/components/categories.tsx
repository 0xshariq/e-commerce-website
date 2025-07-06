import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    id: 1,
    name: "Electronics",
    image: "/placeholder.svg?height=200&width=200",
    href: "/electronics",
  },
  {
    id: 2,
    name: "Fashion",
    image: "/placeholder.svg?height=200&width=200",
    href: "/fashion",
  },
  {
    id: 3,
    name: "Home & Kitchen",
    image: "/placeholder.svg?height=200&width=200",
    href: "/home",
  },
  {
    id: 4,
    name: "Books",
    image: "/placeholder.svg?height=200&width=200",
    href: "/books",
  },
  {
    id: 5,
    name: "Sports",
    image: "/placeholder.svg?height=200&width=200",
    href: "/sports",
  },
  {
    id: 6,
    name: "Beauty",
    image: "/placeholder.svg?height=200&width=200",
    href: "/beauty",
  },
  {
    id: 7,
    name: "Automotive",
    image: "/placeholder.svg?height=200&width=200",
    href: "/automotive",
  },
  {
    id: 8,
    name: "Toys & Games",
    image: "/placeholder.svg?height=200&width=200",
    href: "/toys",
  },
]

export function Categories() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={category.href}>
              <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-white text-sm">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const deals = [
  {
    id: 1,
    title: "Lightning Deal",
    product: "Wireless Headphones",
    originalPrice: 199,
    salePrice: 99,
    discount: 50,
    image: "/placeholder.svg?height=300&width=300",
    timeLeft: "2h 30m",
  },
  {
    id: 2,
    title: "Flash Sale",
    product: "Smart Watch",
    originalPrice: 299,
    salePrice: 179,
    discount: 40,
    image: "/placeholder.svg?height=300&width=300",
    timeLeft: "5h 15m",
  },
  {
    id: 3,
    title: "Daily Deal",
    product: "Bluetooth Speaker",
    originalPrice: 149,
    salePrice: 89,
    discount: 40,
    image: "/placeholder.svg?height=300&width=300",
    timeLeft: "1h 45m",
  },
]

export function Deals() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-white">Today&apos;s Deals</h2>
          <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
            View All Deals
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <Card
              key={deal.id}
              className="bg-gray-800 border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <Image
                  src={deal.image || "/placeholder.svg"}
                  alt={deal.product}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <Badge className="absolute top-4 left-4 bg-red-600 text-white">{deal.discount}% OFF</Badge>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {deal.timeLeft}
                </div>
              </div>
              <CardContent className="p-6">
                <Badge variant="outline" className="mb-2 border-orange-600 text-orange-600">
                  {deal.title}
                </Badge>
                <h3 className="text-xl font-semibold text-white mb-2">{deal.product}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-orange-400">${deal.salePrice}</span>
                  <span className="text-gray-400 line-through">${deal.originalPrice}</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Grab Deal</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { FeaturedProducts } from "@/components/featured-products"
import { Deals } from "@/components/deals"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main>
        <Hero />
        <Categories />
        <Deals />
        <FeaturedProducts />
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const banners = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    subtitle: "Up to 70% off on smartphones, laptops & more",
    image: "/placeholder.svg?height=400&width=800",
    cta: "Shop Now",
    bgColor: "from-blue-600 to-purple-600",
  },
  {
    id: 2,
    title: "Fashion Week Special",
    subtitle: "Trending styles at unbeatable prices",
    image: "/placeholder.svg?height=400&width=800",
    cta: "Explore Fashion",
    bgColor: "from-pink-600 to-red-600",
  },
  {
    id: 3,
    title: "Home Essentials",
    subtitle: "Transform your space with our collection",
    image: "/placeholder.svg?height=400&width=800",
    cta: "Shop Home",
    bgColor: "from-green-600 to-teal-600",
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative h-[500px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <div className={`h-full bg-gradient-to-r ${banner.bgColor} flex items-center`}>
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                  <p className="text-xl mb-8 text-gray-100">{banner.subtitle}</p>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    {banner.cta}
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Image
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    width={600}
                    height={400}
                    className="rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}

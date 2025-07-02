import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Shield, Heart, Award, TrendingUp, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-white p-3 rounded-lg">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-white">ShopHub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Your Trusted E-commerce Platform</h1>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto">
            Connecting millions of customers with thousands of vendors worldwide. We're building the future of online
            shopping with innovation, trust, and excellence.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">2M+</div>
              <div className="text-gray-300">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">50K+</div>
              <div className="text-gray-300">Active Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">1M+</div>
              <div className="text-gray-300">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Founded on Innovation</h3>
                <p className="text-gray-300 mb-6">
                  ShopHub was born from a simple idea: make online shopping accessible, secure, and enjoyable for
                  everyone. Founded in 2020, we've grown from a small startup to a global platform serving millions.
                </p>
                <p className="text-gray-300 mb-6">
                  Our mission is to empower businesses of all sizes to reach customers worldwide while providing
                  shoppers with an unparalleled selection of quality products at competitive prices.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-orange-600 text-white">Innovation</Badge>
                  <Badge className="bg-blue-600 text-white">Trust</Badge>
                  <Badge className="bg-green-600 text-white">Quality</Badge>
                  <Badge className="bg-purple-600 text-white">Excellence</Badge>
                </div>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Secure Payment Processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">24/7 Customer Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Fast & Reliable Shipping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Quality Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-white">Customer First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  Every decision we make is guided by what's best for our customers. Your satisfaction is our top
                  priority.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-white">Trust & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  We implement the highest security standards to protect your data and ensure safe transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-white">Continuous Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">
                  We're constantly innovating and improving our platform to serve you better and stay ahead of the
                  curve.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Sarah Johnson", role: "CEO & Founder", image: "/placeholder.svg?height=200&width=200" },
              { name: "Michael Chen", role: "CTO", image: "/placeholder.svg?height=200&width=200" },
              { name: "Emily Rodriguez", role: "VP of Operations", image: "/placeholder.svg?height=200&width=200" },
            ].map((member, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4"></div>
                  <CardTitle className="text-white">{member.name}</CardTitle>
                  <CardDescription className="text-orange-400">{member.role}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Recognition & Awards</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: "Best E-commerce Platform", year: "2024", org: "Tech Awards" },
              { title: "Customer Choice Award", year: "2023", org: "Commerce Weekly" },
              { title: "Innovation in Retail", year: "2023", org: "Retail Excellence" },
              { title: "Fastest Growing Platform", year: "2022", org: "Business Today" },
            ].map((award, index) => (
              <Card key={index} className="bg-gray-700 border-gray-600 text-center">
                <CardHeader>
                  <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <CardTitle className="text-white text-lg">{award.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {award.org} • {award.year}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

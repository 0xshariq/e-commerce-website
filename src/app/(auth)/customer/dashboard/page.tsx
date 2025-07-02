import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Package, MapPin, Star, TrendingUp, Plus, Eye, Search } from "lucide-react"

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "customer") {
    redirect("/customer/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your orders, wishlist, and account settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Orders</CardTitle>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">12</div>
              <p className="text-xs text-gray-400">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Wishlist Items</CardTitle>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">8</div>
              <p className="text-xs text-gray-400">3 items on sale</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Spent</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">$1,234</div>
              <p className="text-xs text-gray-400">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Saved Addresses</CardTitle>
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">3</div>
              <p className="text-xs text-gray-400">1 default address</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <Button className="h-16 sm:h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Browse Products
          </Button>
          <Button className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            My Wishlist
          </Button>
          <Button className="h-16 sm:h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            Track Orders
          </Button>
          <Button className="h-16 sm:h-20 bg-orange-600 hover:bg-orange-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            Addresses
          </Button>
        </div>

        {/* Recent Orders and Recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Recent Orders</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((order) => (
                <div
                  key={order}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">Order #{order}234567</p>
                      <p className="text-xs sm:text-sm text-gray-400">2 items • $89.99</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                      Delivered
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white h-auto p-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Recommended for You</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Based on your purchase history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-lg flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">Product Name {item}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-400">4.5 (123)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm sm:text-base">$49.99</p>
                    <p className="text-xs sm:text-sm text-gray-400 line-through">$69.99</p>
                    <Button size="sm" className="mt-1 bg-blue-600 hover:bg-blue-700 text-xs h-7">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

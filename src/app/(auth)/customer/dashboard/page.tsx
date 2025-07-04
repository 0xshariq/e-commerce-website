"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Heart,
  Package,
  MapPin,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

interface DashboardData {
  stats: {
    totalOrders: number
    wishlistCount: number
    totalSpent: number
    savedAddresses: number
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    productName: string
    quantity: number
    amount: number
    status: string
    createdAt: string
    vendor: string
  }>
  recommendations: Array<{
    id: number
    name: string
    price: number
    originalPrice: number
    rating: number
    reviews: number
    image: string
  }>
  refundRequests: Array<{
    id: string
    orderId: string
    orderNumber: string
    amount: number
    requestStatus: "pending" | "accepted" | "rejected"
    reason: string
    createdAt: string
  }>
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session?.user?.role !== "customer") {
      redirect("/customer/signin")
    }

    fetchDashboardData()
  }, [session, status])

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, refundResponse] = await Promise.all([
        fetch("/api/dashboard/customer"),
        fetch("/api/refund/request"),
      ])

      const dashboardResult = await dashboardResponse.json()
      const refundResult = await refundResponse.json()

      setDashboardData({
        ...dashboardResult,
        refundRequests: refundResult.refundRequests || [],
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Failed to load dashboard data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name}!
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
              <div className="text-xl sm:text-2xl font-bold text-white">{dashboardData.stats.totalOrders}</div>
              <p className="text-xs text-gray-400">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Wishlist Items</CardTitle>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{dashboardData.stats.wishlistCount}</div>
              <p className="text-xs text-gray-400">3 items on sale</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Spent</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                ${dashboardData.stats.totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Saved Addresses</CardTitle>
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{dashboardData.stats.savedAddresses}</div>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Orders */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Recent Orders</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{order.orderNumber}</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {order.quantity} items • ${order.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        order.status === "delivered"
                          ? "border-green-600 text-green-400"
                          : order.status === "shipped"
                            ? "border-blue-600 text-blue-400"
                            : order.status === "processing"
                              ? "border-yellow-600 text-yellow-400"
                              : "border-orange-600 text-orange-400"
                      }`}
                    >
                      {order.status}
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

          {/* Refund Requests */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Refund Requests
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">Track your refund requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {dashboardData.refundRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No refund requests</p>
                </div>
              ) : (
                dashboardData.refundRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm sm:text-base truncate">{request.orderNumber}</p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          ₹{request.amount} • {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          request.requestStatus === "accepted"
                            ? "border-green-600 text-green-400"
                            : request.requestStatus === "rejected"
                              ? "border-red-600 text-red-400"
                              : "border-yellow-600 text-yellow-400"
                        }`}
                      >
                        {request.requestStatus}
                      </Badge>
                      {request.requestStatus === "accepted" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-green-400 hover:text-green-300 h-auto p-1"
                          onClick={() => (window.location.href = `/refund?requestId=${request.id}`)}
                        >
                          Proceed
                        </Button>
                      )}
                      {request.requestStatus === "rejected" && <span className="text-xs text-red-400">Rejected</span>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Recommended for You</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Based on your purchase history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {dashboardData.recommendations.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-lg flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{item.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-400">
                          {item.rating} ({item.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm sm:text-base">${item.price}</p>
                    <p className="text-xs sm:text-sm text-gray-400 line-through">${item.originalPrice}</p>
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

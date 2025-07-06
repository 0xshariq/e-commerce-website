"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  UserX,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  Loader2
} from "lucide-react"

interface AdminDashboardData {
  stats: {
    totalRevenue: number
    monthlyRevenue: number
    totalCustomers: number
    newCustomers: number
    totalVendors: number
    pendingVendors: number
    totalProducts: number
    flaggedProducts: number
    totalOrders: number
    ordersThisMonth: number
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    customer: string
    vendor: string
    amount: number
    status: string
    createdAt: string
  }>
  recentActivities: Array<{
    id: string
    type: string
    action: string
    user: string
    details: string
    timestamp: string
  }>
  pendingApprovals: {
    vendors: Array<{
      id: string
      name: string
      email: string
      businessType: string
      createdAt: string
    }>
    products: Array<{
      id: string
      name: string
      category: string
      price: number
      vendor: string
      createdAt: string
    }>
  }
  systemHealth: {
    apiStatus: string
    databaseStatus: string
    storageUsage: number
    cdnStatus: string
  }
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/admin")
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Failed to fetch admin dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard data...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
        <p className="text-red-400 mb-4">{error || "Failed to load dashboard data"}</p>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {formatCurrency(data.stats.totalRevenue)}
            </div>
            <p className="text-xs text-green-400">
              +{formatCurrency(data.stats.monthlyRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Customers</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{data.stats.totalCustomers}</div>
            <p className="text-xs text-blue-400">+{data.stats.newCustomers} new this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Vendors</CardTitle>
            <Store className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{data.stats.totalVendors}</div>
            <p className="text-xs text-yellow-400">{data.stats.pendingVendors} pending approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Products</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{data.stats.totalProducts}</div>
            <p className="text-xs text-red-400">{data.stats.flaggedProducts} flagged for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Button className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          Approve Vendors ({data.stats.pendingVendors})
        </Button>
        <Button className="h-16 sm:h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          Review Products ({data.stats.flaggedProducts})
        </Button>
        <Button className="h-16 sm:h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          User Management
        </Button>
        <Button className="h-16 sm:h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          Analytics
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2 bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Revenue Overview</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Monthly revenue and growth trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm sm:text-base">Revenue Chart</p>
                <p className="text-xs sm:text-sm text-gray-500">Monthly: {formatCurrency(data.stats.monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">System Status</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Platform health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.systemHealth.apiStatus === "online" ? "bg-green-400" : "bg-red-400"}`}></div>
                <span className="text-white text-sm">API Status</span>
              </div>
              <Badge className={`text-xs ${data.systemHealth.apiStatus === "online" ? "bg-green-600" : "bg-red-600"} text-white`}>
                {data.systemHealth.apiStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.systemHealth.databaseStatus === "healthy" ? "bg-green-400" : "bg-red-400"}`}></div>
                <span className="text-white text-sm">Database</span>
              </div>
              <Badge className={`text-xs ${data.systemHealth.databaseStatus === "healthy" ? "bg-green-600" : "bg-red-600"} text-white`}>
                {data.systemHealth.databaseStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.systemHealth.storageUsage < 90 ? "bg-yellow-400" : "bg-red-400"}`}></div>
                <span className="text-white text-sm">Storage</span>
              </div>
              <Badge className={`text-xs ${data.systemHealth.storageUsage < 90 ? "bg-yellow-600" : "bg-red-600"} text-white`}>
                {data.systemHealth.storageUsage}% Used
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.systemHealth.cdnStatus === "active" ? "bg-green-400" : "bg-red-400"}`}></div>
                <span className="text-white text-sm">CDN</span>
              </div>
              <Badge className={`text-xs ${data.systemHealth.cdnStatus === "active" ? "bg-green-600" : "bg-red-600"} text-white`}>
                {data.systemHealth.cdnStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Pending Approvals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Activities */}
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Recent Activities</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {data.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {activity.type === "order" && (
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                  )}
                  {activity.type === "vendor_registration" && (
                    <Store className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                  )}
                  {activity.type === "customer_registration" && (
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{activity.action}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Pending Approvals</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Items requiring admin approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {data.pendingApprovals.vendors.slice(0, 3).map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{vendor.name}</p>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{vendor.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                    Vendor
                  </Badge>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            {data.pendingApprovals.products.slice(0, 2).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{product.name}</p>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    {product.category} • {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs border-purple-600 text-purple-400">
                    Product
                  </Badge>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

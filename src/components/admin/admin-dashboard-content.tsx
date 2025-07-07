"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AdminRefundRequests from "./refund-requests"
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
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface AdminDashboardData {
  stats: {
    totalRevenue: number
    revenueGrowth: number
    activeUsers: number
    newUsers: number
    activeVendors: number
    pendingVendors: number
    totalProducts: number
    flaggedProducts: number
  }
  recentActivities: Array<{
    id: string
    action: string
    user: string
    timestamp: string
    type: "vendor" | "flag" | "order" | "suspend" | "user"
  }>
  pendingVendors: Array<{
    id: string
    businessName: string
    email: string
    registrationDate: string
    businessType: string
  }>
  flaggedProducts: Array<{
    id: string
    name: string
    vendor: string
    reason: string
    reportedBy: string
    flaggedDate: string
  }>
  systemHealth: {
    api: "online" | "offline" | "warning"
    database: "healthy" | "warning" | "critical"
    storage: {
      status: "normal" | "warning" | "critical"
      usage: number
    }
    cdn: "active" | "inactive"
  }
}

export default function AdminDashboardContent() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/dashboard/admin")
      
      if (!response.ok) {
        throw new Error("Failed to fetch admin dashboard data")
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVendorAction = async (vendorId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error)
    }
  }

  const handleProductAction = async (productId: string, action: "approve" | "remove") => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} product:`, error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">{error || "Failed to load dashboard data"}</p>
          <Button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm sm:text-base">Complete control and oversight of ShopHub platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ₹{dashboardData.stats.totalRevenue.toLocaleString()}
            </div>
            <p className={`text-xs ${dashboardData.stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dashboardData.stats.revenueGrowth >= 0 ? '+' : ''}{dashboardData.stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {dashboardData.stats.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-blue-400">+{dashboardData.stats.newUsers} new this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Vendors</CardTitle>
            <Store className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {dashboardData.stats.activeVendors.toLocaleString()}
            </div>
            <p className="text-xs text-yellow-400">
              {dashboardData.stats.pendingVendors} pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Products</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {dashboardData.stats.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-red-400">
              {dashboardData.stats.flaggedProducts} flagged for review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Button 
          className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          onClick={() => document.getElementById('pending-vendors')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          Approve Vendors ({dashboardData.stats.pendingVendors})
        </Button>
        <Button 
          className="h-16 sm:h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          onClick={() => document.getElementById('flagged-products')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          Review Products ({dashboardData.stats.flaggedProducts})
        </Button>
        <Button 
          className="h-16 sm:h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          onClick={() => window.location.href = "/admin/users"}
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          User Management
        </Button>
        <Button 
          className="h-16 sm:h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
          onClick={() => window.location.href = "/admin/analytics"}
        >
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          Analytics
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart Placeholder */}
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
                <p className="text-xs sm:text-sm text-gray-500">Chart library integration needed</p>
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
                <div className={`w-2 h-2 rounded-full ${
                  dashboardData.systemHealth.api === 'online' ? 'bg-green-400' : 
                  dashboardData.systemHealth.api === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white text-sm">API Status</span>
              </div>
              <Badge className={`text-xs ${
                dashboardData.systemHealth.api === 'online' ? 'bg-green-600 text-white' : 
                dashboardData.systemHealth.api === 'warning' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {dashboardData.systemHealth.api}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  dashboardData.systemHealth.database === 'healthy' ? 'bg-green-400' : 
                  dashboardData.systemHealth.database === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white text-sm">Database</span>
              </div>
              <Badge className={`text-xs ${
                dashboardData.systemHealth.database === 'healthy' ? 'bg-green-600 text-white' : 
                dashboardData.systemHealth.database === 'warning' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {dashboardData.systemHealth.database}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  dashboardData.systemHealth.storage.status === 'normal' ? 'bg-green-400' : 
                  dashboardData.systemHealth.storage.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white text-sm">Storage</span>
              </div>
              <Badge className={`text-xs ${
                dashboardData.systemHealth.storage.status === 'normal' ? 'bg-green-600 text-white' : 
                dashboardData.systemHealth.storage.status === 'warning' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {dashboardData.systemHealth.storage.usage}% Used
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  dashboardData.systemHealth.cdn === 'active' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white text-sm">CDN</span>
              </div>
              <Badge className={`text-xs ${
                dashboardData.systemHealth.cdn === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {dashboardData.systemHealth.cdn}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Management Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Activities */}
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Recent Activities</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {activity.type === "vendor" && (
                    <Store className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                  )}
                  {activity.type === "flag" && (
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                  )}
                  {activity.type === "order" && (
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                  )}
                  {activity.type === "suspend" && (
                    <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                  )}
                  {activity.type === "user" && (
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{activity.action}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Vendor Approvals */}
        <Card id="pending-vendors" className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Pending Vendor Approvals</CardTitle>
            <CardDescription className="text-gray-400 text-sm">New vendor registrations awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {dashboardData.pendingVendors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No pending vendor approvals</p>
              </div>
            ) : (
              dashboardData.pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{vendor.businessName}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{vendor.email}</p>
                    <p className="text-xs text-gray-500">
                      {vendor.businessType} • Registered {new Date(vendor.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs h-8 px-3"
                      onClick={() => handleVendorAction(vendor.id, "approve")}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs h-8 px-3"
                      onClick={() => handleVendorAction(vendor.id, "reject")}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flagged Products */}
      <Card id="flagged-products" className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Flagged Products</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Products requiring review</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {dashboardData.flaggedProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No flagged products</p>
            </div>
          ) : (
            dashboardData.flaggedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{product.name}</p>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">Vendor: {product.vendor}</p>
                  <p className="text-xs text-red-400">
                    Reason: {product.reason} • Reported by {product.reportedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    Flagged {new Date(product.flaggedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-xs h-8 px-3"
                    onClick={() => window.location.href = `/admin/products/${product.id}`}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-xs h-8 px-3"
                    onClick={() => handleProductAction(product.id, "approve")}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs h-8 px-3"
                    onClick={() => handleProductAction(product.id, "remove")}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Refund Requests */}
      <Card id="refund-requests" className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Refund Requests</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Manage customer refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminRefundRequests />
        </CardContent>
      </Card>
    </div>
  )
}

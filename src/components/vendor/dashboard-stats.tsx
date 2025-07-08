"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, timeAgo } from "@/utils/formatting"
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Store,
  Star,
  Eye,
  Users
} from "lucide-react"

interface DashboardStats {
  profile?: {
    firstName: string
    lastName: string
    businessInfo: {
      businessName: string
      businessType: string
      businessCategory: string
    }
    isApproved: boolean
    accountStatus: string
    performanceMetrics: {
      totalSales: number
      totalOrders: number
      averageRating: number
      totalReviews: number
    }
  }
  totalRevenue: number
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  activeCoupons: number
  activeSales: number
  recentOrders: Array<any>
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch data from existing APIs
      const [productsRes, ordersRes, couponsRes, salesRes] = await Promise.all([
        fetch("/api/vendor/products"),
        fetch("/api/vendor/orders"), 
        fetch("/api/vendor/coupons"),
        fetch("/api/vendor/sales")
      ])

      if (productsRes.ok && ordersRes.ok) {
        const [productsData, ordersData] = await Promise.all([
          productsRes.json(),
          ordersRes.json()
        ])

        // Get coupons and sales data if APIs exist
        let couponsData = { coupons: [] }
        let salesData = { sales: [] }
        
        if (couponsRes.ok) {
          couponsData = await couponsRes.json()
        }
        
        if (salesRes.ok) {
          salesData = await salesRes.json()
        }

        const products = productsData.products || []
        const orders = ordersData.orders || []
        const coupons = couponsData.coupons || []
        const sales = salesData.sales || []

        // Calculate stats
        const totalRevenue = orders.reduce((sum: number, order: any) => {
          if (order.orderStatus === "delivered") {
            return sum + (order.totalAmount || 0)
          }
          return sum
        }, 0)

        const activeCoupons = coupons.filter((c: any) => 
          c.isActive && new Date(c.expiryDate) > new Date()
        ).length

        const activeSales = sales.filter((s: any) => 
          new Date(s.saleStartingDate) <= new Date() && 
          new Date(s.saleEndingDate) >= new Date()
        ).length

        setStats({
          totalRevenue,
          totalProducts: products.length,
          activeProducts: products.filter((p: any) => p.status === "active").length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.orderStatus === "pending").length,
          activeCoupons,
          activeSales,
          recentOrders: orders.slice(0, 5) // Add recent orders
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for header */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        
        {/* Loading skeleton for stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800/90 backdrop-blur-sm border-gray-700 animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vendor Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            {stats.profile?.businessInfo?.businessName || 'Vendor Dashboard'}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Welcome back, {stats.profile?.firstName}! Here's your business overview.
          </p>
          <div className="flex items-center gap-2 mt-2">
            {stats.profile?.isApproved ? (
              <Badge className="bg-green-600">
                <Store className="h-3 w-3 mr-1" />
                Approved Vendor
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                <Store className="h-3 w-3 mr-1" />
                Pending Approval
              </Badge>
            )}
            {stats.profile?.performanceMetrics?.averageRating && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                <Star className="h-3 w-3 mr-1" />
                {stats.profile.performanceMetrics.averageRating.toFixed(1)} Rating
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-400">
              {stats.totalOrders} total orders
            </p>
          </CardContent>
        </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Products</CardTitle>
          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalProducts}</div>
          <p className="text-xs text-blue-400">
            {stats.activeProducts} active
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Orders</CardTitle>
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalOrders}</div>
          <p className="text-xs text-orange-400">
            {stats.pendingOrders} pending
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Promotions</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {stats.activeCoupons + stats.activeSales}
          </div>
          <p className="text-xs text-purple-400">
            {stats.activeCoupons} coupons, {stats.activeSales} sales
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

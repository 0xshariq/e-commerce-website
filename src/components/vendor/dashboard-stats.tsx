"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalRevenue: number
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  activeCoupons: number
  activeSales: number
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
          activeSales
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
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
  )
}

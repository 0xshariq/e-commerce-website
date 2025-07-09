"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import AdminRefundRequests from "./refund-requests"
import StatsCards from "./stats-cards"
import QuickActions from "./quick-actions"
import SystemHealthCard from "./system-health-card"
import RecentActivitiesCard from "./recent-activities-card"
import PendingVendorsCard from "./pending-vendors-card"
import FlaggedProductsCard from "./flagged-products-card"
import RevenueOverviewCard from "./revenue-overview-card"
import axios from "axios"

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
      
      const response = await axios.get("/api/dashboard/admin")
      setDashboardData(response.data)
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVendorAction = async (vendorId: string, action: "approve" | "reject") => {
    try {
      const response = await axios.patch(`/api/admin/vendors/${vendorId}/${action}`, {}, {
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (response.status === 200) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error)
    }
  }

  const handleProductAction = async (productId: string, action: "approve" | "remove") => {
    try {
      const response = await axios.patch(`/api/admin/products/${productId}/${action}`, {}, {
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (response.status === 200) {
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
      <StatsCards stats={dashboardData.stats} />

      {/* Quick Actions */}
      <QuickActions stats={dashboardData.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <RevenueOverviewCard />

        {/* System Status */}
        <SystemHealthCard systemHealth={dashboardData.systemHealth} />
      </div>

      {/* Recent Activities and Management Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Activities */}
        <RecentActivitiesCard activities={dashboardData.recentActivities} />

        {/* Pending Vendor Approvals */}
        <PendingVendorsCard 
          pendingVendors={dashboardData.pendingVendors}
          onApprove={(vendorId) => handleVendorAction(vendorId, "approve")}
          onReject={(vendorId) => handleVendorAction(vendorId, "reject")}
        />
      </div>

      {/* Flagged Products */}
      <FlaggedProductsCard 
        flaggedProducts={dashboardData.flaggedProducts}
        onApprove={(productId) => handleProductAction(productId, "approve")}
        onRemove={(productId) => handleProductAction(productId, "remove")}
      />

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

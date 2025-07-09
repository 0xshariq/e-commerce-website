"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import CustomerRefundRequests from "./refund-requests"
import ProfileHeader from "./profile-header"
import StatsCards from "./stats-cards"
import RecentOrders from "./recent-orders"
import Recommendations from "./recommendations"

interface DashboardData {
  profile?: {
    firstName: string
    lastName: string
    email: string
    mobileNo: string
    membershipTier: string
    loyaltyPoints: number
    addresses: Array<any>
  }
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

interface CustomerDashboardContentProps {
  customerName: string
}

export default function CustomerDashboardContent({ customerName }: CustomerDashboardContentProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the unified profile API and dashboard API
      const [profileResponse, dashboardResponse, refundResponse] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/dashboard/customer"),
        fetch("/api/refund/request"),
      ])

      if (!profileResponse.ok || !dashboardResponse.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const profileResult = await profileResponse.json()
      const dashboardResult = await dashboardResponse.json()
      const refundResult = refundResponse.ok ? await refundResponse.json() : { refundRequests: [] }

      setDashboardData({
        ...dashboardResult,
        profile: profileResult.user,
        refundRequests: refundResult.refundRequests || [],
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load dashboard data."}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <ProfileHeader customerName={customerName} profile={dashboardData.profile} />

      {/* Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* Recent Orders and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders recentOrders={dashboardData.recentOrders} />
        <Recommendations recommendations={dashboardData.recommendations} />
      </div>

      {/* Refund Requests */}
      <div className="mb-8">
        <CustomerRefundRequests />
      </div>
    </div>
  )
}

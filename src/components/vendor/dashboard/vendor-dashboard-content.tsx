"use client"

import DashboardStats from "@/components/vendor/dashboard/dashboard-stats"
import RevenueChart from "@/components/vendor/dashboard/revenue-chart"
import RecentProducts from "@/components/vendor/dashboard/recent-products"
import RecentOrders from "@/components/vendor/dashboard/recent-orders"
import VendorRefundRequests from "@/components/vendor/dashboard/refund-requests"
import QuickActions from "@/components/vendor/dashboard/quick-actions"

interface VendorDashboardContentProps {
  vendorName: string
}

export default function VendorDashboardContent({ vendorName }: VendorDashboardContentProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Welcome, {vendorName}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage your store, products, and orders</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Revenue Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <RevenueChart />

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Recent Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentProducts />
        <RecentOrders />
      </div>

      {/* Refund Requests */}
      <div className="mb-8">
        <VendorRefundRequests />
      </div>
    </>
  )
}

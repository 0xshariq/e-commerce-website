import { getServerSession } from "next-auth/next"
import type { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Package, ShoppingCart } from "lucide-react"
import Link from "next/link"
import DashboardStats from "@/components/vendor/dashboard-stats"
import RevenueChart from "@/components/vendor/revenue-chart"
import RecentProducts from "@/components/vendor/recent-products"
import RecentOrders from "@/components/vendor/recent-orders"
import VendorRefundRequests from "@/components/vendor/refund-requests"

export default async function VendorDashboard() {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "vendor") {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome, {session.user.name}
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
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/vendor/products/create">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link href="/vendor/products">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/vendor/orders">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
              </Link>
              <Link href="/vendor/profile">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
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
      </div>
    </div>
  )
}

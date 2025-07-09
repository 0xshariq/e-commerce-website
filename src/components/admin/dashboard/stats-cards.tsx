"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Package, DollarSign } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    activeUsers: number;
    newUsers: number;
    activeVendors: number;
    pendingVendors: number;
    totalProducts: number;
    flaggedProducts: number;
  } | undefined;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className={`text-xs ${(stats?.revenueGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(stats?.revenueGrowth || 0) >= 0 ? '+' : ''}{stats?.revenueGrowth || 0}% from last month
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
            {(stats?.activeUsers || 0).toLocaleString()}
          </div>
          <p className="text-xs text-blue-400">+{stats?.newUsers || 0} new this month</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Vendors</CardTitle>
          <Store className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {(stats?.activeVendors || 0).toLocaleString()}
          </div>
          <p className="text-xs text-yellow-400">
            {stats?.pendingVendors || 0} pending approval
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
            {(stats?.totalProducts || 0).toLocaleString()}
          </div>
          <p className="text-xs text-red-400">
            {stats?.flaggedProducts || 0} flagged for review
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

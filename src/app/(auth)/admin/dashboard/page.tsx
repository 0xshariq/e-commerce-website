import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
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
} from "lucide-react"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/admin/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Complete control and oversight of ShopHub platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">$45,231</div>
              <p className="text-xs text-green-400">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Users</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">2,350</div>
              <p className="text-xs text-blue-400">+180 new this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Vendors</CardTitle>
              <Store className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">573</div>
              <p className="text-xs text-yellow-400">12 pending approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Products</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">12,234</div>
              <p className="text-xs text-red-400">5 flagged for review</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <Button className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            Approve Vendors (12)
          </Button>
          <Button className="h-16 sm:h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            Review Products (5)
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
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
                  <p className="text-gray-400 text-sm sm:text-base">Revenue Chart Placeholder</p>
                  <p className="text-xs sm:text-sm text-gray-500">Integration with charting library needed</p>
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
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">API Status</span>
                </div>
                <Badge className="bg-green-600 text-white text-xs">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">Database</span>
                </div>
                <Badge className="bg-green-600 text-white text-xs">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white text-sm">Storage</span>
                </div>
                <Badge className="bg-yellow-600 text-white text-xs">85% Used</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm">CDN</span>
                </div>
                <Badge className="bg-green-600 text-white text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities and User Management */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Activities */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Recent Activities</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[
                { action: "New vendor registration", user: "TechStore Inc.", time: "2 minutes ago", type: "vendor" },
                { action: "Product flagged", user: "Customer #1234", time: "15 minutes ago", type: "flag" },
                { action: "Large order placed", user: "Enterprise Corp", time: "1 hour ago", type: "order" },
                { action: "Vendor suspended", user: "BadSeller", time: "2 hours ago", type: "suspend" },
              ].map((activity, index) => (
                <div
                  key={index}
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
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{activity.action}</p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">User Management</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Manage platform users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[
                { name: "John Doe", email: "john@example.com", role: "customer", status: "active" },
                { name: "TechStore Inc.", email: "tech@store.com", role: "vendor", status: "pending" },
                { name: "Jane Smith", email: "jane@example.com", role: "customer", status: "suspended" },
                { name: "GadgetWorld", email: "info@gadget.com", role: "vendor", status: "active" },
              ].map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{user.name}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        user.role === "vendor" ? "border-green-600 text-green-400" : "border-blue-600 text-blue-400"
                      }`}
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        user.status === "active"
                          ? "border-green-600 text-green-400"
                          : user.status === "pending"
                            ? "border-yellow-600 text-yellow-400"
                            : "border-red-600 text-red-400"
                      }`}
                    >
                      {user.status}
                    </Badge>
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

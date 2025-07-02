import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"

export default async function VendorDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "vendor") {
    redirect("/vendor/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Vendor Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your store, products, and orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">$12,234</div>
              <p className="text-xs text-green-400">+15.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Products</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">156</div>
              <p className="text-xs text-blue-400">12 added this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Orders</CardTitle>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">89</div>
              <p className="text-xs text-purple-400">+7 new orders</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">3.2%</div>
              <p className="text-xs text-orange-400">+0.5% improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <Button className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Add Product
          </Button>
          <Button className="h-16 sm:h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            Analytics
          </Button>
          <Button className="h-16 sm:h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Orders
          </Button>
          <Button className="h-16 sm:h-20 bg-orange-600 hover:bg-orange-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
            Store Info
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Orders */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Recent Orders</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[
                { id: "ORD-001", customer: "John Doe", amount: "$89.99", status: "completed", time: "2 hours ago" },
                { id: "ORD-002", customer: "Jane Smith", amount: "$156.50", status: "processing", time: "4 hours ago" },
                { id: "ORD-003", customer: "Mike Johnson", amount: "$45.00", status: "pending", time: "6 hours ago" },
                { id: "ORD-004", customer: "Sarah Wilson", amount: "$234.99", status: "completed", time: "1 day ago" },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {order.status === "completed" && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                    )}
                    {order.status === "processing" && (
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0" />
                    )}
                    {order.status === "pending" && (
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{order.id}</p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm sm:text-base">{order.amount}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        order.status === "completed"
                          ? "border-green-600 text-green-400"
                          : order.status === "processing"
                            ? "border-yellow-600 text-yellow-400"
                            : "border-orange-600 text-orange-400"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Top Selling Products</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Your best performing products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[
                { name: "Wireless Headphones", sales: 45, revenue: "$2,250", trend: "+12%" },
                { name: "Smart Watch", sales: 32, revenue: "$4,800", trend: "+8%" },
                { name: "Bluetooth Speaker", sales: 28, revenue: "$1,400", trend: "+15%" },
                { name: "Phone Case", sales: 67, revenue: "$1,005", trend: "+22%" },
              ].map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-lg flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{product.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm sm:text-base">{product.revenue}</p>
                    <p className="text-xs sm:text-sm text-green-400">{product.trend}</p>
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

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Store, Edit, Shield, Package, DollarSign, Camera, Phone, Mail, MapPin, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface VendorStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  rating: number
}

export default function VendorProfileForm() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 0
  })
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    upiId: "",
    shopAddress: "",
    businessName: ""
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        mobileNo: (session.user as any).mobileNo || "",
        upiId: (session.user as any).upiId || "",
        shopAddress: (session.user as any).shopAddress || "",
        businessName: (session.user as any).businessName || session.user.name || ""
      })
    }
    fetchStats()
  }, [session])

  const fetchStats = async () => {
    try {
      // Fetch from existing APIs
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/vendor/products"),
        fetch("/api/vendor/orders")
      ])

      if (productsRes.ok && ordersRes.ok) {
        const [productsData, ordersData] = await Promise.all([
          productsRes.json(),
          ordersRes.json()
        ])

        const products = productsData.products || []
        const orders = ordersData.orders || []
        
        const revenue = orders.reduce((sum: number, order: any) => {
          if (order.orderStatus === "delivered") {
            return sum + (order.totalAmount || 0)
          }
          return sum
        }, 0)

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          rating: 4.8 // This would come from reviews in real implementation
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            ...formData
          }
        })
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error("Error updating profile")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Vendor Profile</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your store information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Card */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="bg-green-600 text-white text-xl sm:text-2xl">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-white text-lg sm:text-xl">{session.user.name}</CardTitle>
              <p className="text-gray-400 text-sm break-all">{session.user.email}</p>
              <Badge variant="outline" className="border-green-600 text-green-400 w-fit mx-auto mt-2">
                <Store className="h-3 w-3 mr-1" />
                VENDOR
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile Picture
              </Button>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">{stats.totalProducts}</div>
                  <div className="text-xs text-gray-400">Products</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">{stats.rating}</div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Store Information</CardTitle>
                <p className="text-gray-400 text-sm">Update your store details</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-gray-300 text-sm font-medium">
                        Business Name
                      </Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white h-11"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-gray-300 text-sm font-medium">
                        Mobile Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="mobile"
                          type="tel"
                          value={formData.mobileNo}
                          onChange={(e) => handleInputChange("mobileNo", e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upiId" className="text-gray-300 text-sm font-medium">
                        UPI ID
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="upiId"
                          value={formData.upiId}
                          onChange={(e) => handleInputChange("upiId", e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white h-11"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopAddress" className="text-gray-300 text-sm font-medium">
                      Shop Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                      <Textarea
                        id="shopAddress"
                        value={formData.shopAddress}
                        onChange={(e) => handleInputChange("shopAddress", e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white min-h-[80px]"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Store Statistics */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Store Performance</CardTitle>
                <p className="text-gray-400 text-sm">Your store statistics</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.totalProducts}</div>
                    <div className="text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-1">
                      <Package className="h-3 w-3" />
                      Products
                    </div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.totalOrders}</div>
                    <div className="text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-1">
                      <Store className="h-3 w-3" />
                      Orders
                    </div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-400 flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Revenue
                    </div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-orange-400">{stats.rating}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <p className="text-gray-400 text-sm">Manage your account security</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-gray-400">Last changed 2 months ago</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent text-sm"
                  >
                    Change Password
                  </Button>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Two-Factor Authentication</p>
                    <p className="text-xs sm:text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent text-sm"
                  >
                    Enable 2FA
                  </Button>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Store Verification</p>
                    <p className="text-xs sm:text-sm text-gray-400">Verify your business documents</p>
                  </div>
                  <Badge className="bg-green-600 text-white w-fit">Verified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Edit, Shield, Camera, Phone, Mail } from "lucide-react"

export default async function CustomerProfile() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "customer") {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Card */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-xl sm:text-2xl">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-white text-lg sm:text-xl">{session.user.name}</CardTitle>
              <CardDescription className="text-gray-400 text-sm break-all">{session.user.email}</CardDescription>
              <Badge variant="outline" className="border-blue-600 text-blue-400 w-fit mx-auto mt-2">
                <User className="h-3 w-3 mr-1" />
                CUSTOMER
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile Picture
              </Button>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">12</div>
                  <div className="text-xs text-gray-400">Orders</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">8</div>
                  <div className="text-xs text-gray-400">Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Account Information</CardTitle>
                <CardDescription className="text-gray-400 text-sm">Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        defaultValue={session.user.name}
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
                        defaultValue={session.user.email}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white h-11"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-gray-300 text-sm font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mobile"
                      type="tel"
                      defaultValue={session.user.mobileNo}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white h-11"
                    />
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Account Statistics</CardTitle>
                <CardDescription className="text-gray-400 text-sm">Your activity summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">12</div>
                    <div className="text-xs sm:text-sm text-gray-400">Total Orders</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">8</div>
                    <div className="text-xs sm:text-sm text-gray-400">Completed</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-400">2</div>
                    <div className="text-xs sm:text-sm text-gray-400">Pending</div>
                  </div>
                  <div className="text-center bg-gray-700/30 rounded-lg p-4">
                    <div className="text-xl sm:text-2xl font-bold text-red-400">1</div>
                    <div className="text-xs sm:text-sm text-gray-400">Cancelled</div>
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
                <CardDescription className="text-gray-400 text-sm">Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-gray-400">Last changed 3 months ago</p>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

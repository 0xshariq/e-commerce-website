"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Users, 
  Store, 
  Shield, 
  ArrowLeft, 
  Loader2, 
  User, 
  Phone,
  Building,
  MapPin,
  CheckCircle,
  Github
} from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer",
    // Vendor specific fields
    businessName: "",
    businessAddress: "",
    businessType: "",
    // Admin specific fields  
    department: "",
    // Customer specific fields
    address: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    // Role-specific validation
    if (formData.role === "vendor" && (!formData.businessName || !formData.businessType)) {
      setError("Business name and type are required for vendors")
      setLoading(false)
      return
    }

    if (formData.role === "admin" && !formData.department) {
      setError("Department is required for admin accounts")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/customer/dashboard" })
    } catch (error) {
      setError("Failed to sign in with social provider.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role })
    setError("")
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "admin":
        return {
          icon: Shield,
          color: "text-purple-600 bg-purple-50 border-purple-200",
          description: "Manage platform operations and user accounts",
          title: "Administrator Account"
        }
      case "vendor":
        return {
          icon: Store,
          color: "text-green-600 bg-green-50 border-green-200",
          description: "Sell products and manage your business",
          title: "Vendor/Seller Account"
        }
      case "customer":
        return {
          icon: Users,
          color: "text-blue-600 bg-blue-50 border-blue-200",
          description: "Shop products and track your orders",
          title: "Customer Account"
        }
      default:
        return {
          icon: Users,
          color: "text-gray-600 bg-gray-50 border-gray-200",
          description: "",
          title: ""
        }
    }
  }

  const roleInfo = getRoleInfo(formData.role)
  const RoleIcon = roleInfo.icon

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Your {formData.role} account has been created successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to sign in page...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <RoleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-gray-600">
                Join ShopHub and start your journey
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Customer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vendor">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-green-600" />
                        <span>Vendor/Seller</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Role Description */}
                <Badge variant="outline" className={`w-full justify-start p-2 ${roleInfo.color}`}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  <span className="text-xs">{roleInfo.description}</span>
                </Badge>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === "vendor" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Business Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select 
                      value={formData.businessType} 
                      onValueChange={(value) => setFormData({...formData, businessType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="service">Service Provider</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="businessAddress"
                        name="businessAddress"
                        placeholder="Enter your business address"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        className="pl-10 min-h-[80px]"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.role === "admin" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Administrative Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => setFormData({...formData, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="customer-service">Customer Service</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.role === "customer" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Additional Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Enter your address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 min-h-[80px]"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  `Create ${roleInfo.title}`
                )}
              </Button>
            </form>

            <Separator />

            {/* Social Sign Up */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Or continue with</p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialSignIn("google")}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialSignIn("github")}
                  className="w-full"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Social sign-up creates a Customer account
              </p>
            </div>

            <Separator />

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-medium text-orange-600 hover:text-orange-700">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-2 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-gray-700 block">
                Terms of Service
              </Link>
              <Link href="/policy" className="hover:text-gray-700 block">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

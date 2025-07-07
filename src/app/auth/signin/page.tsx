"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Mail, Lock, Users, Store, Shield, ArrowLeft, Loader2, Github } from "lucide-react"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRememberMe, setIsRememberMe] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  // Form validation
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.password) {
      setError("Password is required")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        redirect: false,
      })

      if (result?.error) {
        // More specific error messages
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else {
          setError("Invalid credentials. Please check your email, password, and role.")
        }
      } else {
        // Get the session to determine redirect URL based on role
        const session = await getSession()
        const userRole = (session?.user as any)?.role

        // Role-based redirection
        let redirectUrl = callbackUrl
        if (callbackUrl === "/") {
          switch (userRole) {
            case "admin":
              redirectUrl = "/admin/dashboard"
              break
            case "vendor":
              redirectUrl = "/vendor/dashboard"
              break
            case "customer":
              redirectUrl = "/customer/dashboard"
              break
            default:
              redirectUrl = "/"
          }
        }
        
        router.push(redirectUrl)
        router.refresh()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          description: "Access admin dashboard and manage the platform"
        }
      case "vendor":
        return {
          icon: Store,
          color: "text-green-600 bg-green-50 border-green-200",
          description: "Manage your products and business operations"
        }
      case "customer":
        return {
          icon: Users,
          color: "text-blue-600 bg-blue-50 border-blue-200",
          description: "Shop products and manage your orders"
        }
      default:
        return {
          icon: Users,
          color: "text-gray-600 bg-gray-50 border-gray-200",
          description: ""
        }
    }
  }

  const roleInfo = getRoleInfo(formData.role)
  const RoleIcon = roleInfo.icon

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
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your ShopHub account
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
                    <SelectValue placeholder="Select your account type" />
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

              {/* Email Input */}
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

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={isRememberMe}
                  onChange={() => setIsRememberMe(!isRememberMe)}
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <Label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading}
                aria-busy={loading}
                aria-disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <Separator />

            {/* Social Sign In */}
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
            </div>

            <Separator />

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-700">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-2 text-xs text-gray-500">
              <Link href="/faqs" className="hover:text-gray-700 block">
                Need help? Check our FAQs
              </Link>
              <Link href="/contact" className="hover:text-gray-700 block">
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

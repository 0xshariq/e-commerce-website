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
import { INDIAN_STATES } from "@/models/address"
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
  CheckCircle
} from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    // Basic fields (all roles)
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer",
    
    // Address fields (customer and optional for others)
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    
    // Customer specific fields
    dateOfBirth: "",
    gender: "",
    
    // Vendor specific fields - Required
    businessName: "",
    businessType: "",
    businessCategory: "",
    panNumber: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessPostalCode: "",
    upiId: "", // Required for payments
    
    // Vendor specific fields - Optional
    gstNumber: "",
    businessEmail: "",
    businessPhone: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ""
  })
  
  const router = useRouter()

  // Password strength validation
  const checkPasswordStrength = (password: string) => {
    let score = 0
    let feedback = ""

    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    switch (score) {
      case 0:
      case 1:
        feedback = "Very Weak"
        break
      case 2:
        feedback = "Weak"
        break
      case 3:
        feedback = "Fair"
        break
      case 4:
        feedback = "Good"
        break
      case 5:
        feedback = "Strong"
        break
    }

    setPasswordStrength({ score, feedback })
  }

  // Enhanced form validation
  const validateForm = () => {
    // Basic validation for all roles
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return false
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return false
    }

    if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number")
      return false
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    // Role-specific validation
    if (formData.role === "vendor") {
      const requiredVendorFields = {
        businessName: "Business name",
        businessType: "Business type", 
        businessCategory: "Business category",
        panNumber: "PAN number",
        businessAddress: "Business address",
        businessCity: "Business city",
        businessState: "Business state",
        businessPostalCode: "Business postal code",
        upiId: "UPI ID"
      }

      for (const [field, label] of Object.entries(requiredVendorFields)) {
        if (!formData[field as keyof typeof formData]?.trim()) {
          setError(`${label} is required for vendor accounts`)
          return false
        }
      }

      // Validate PAN format
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
        setError("Please enter a valid PAN number (e.g., ABCDE1234F)")
        return false
      }

      // Validate GST if provided
      if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber.toUpperCase())) {
        setError("Please enter a valid GST number")
        return false
      }

      // Validate UPI ID format
      if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        setError("Please enter a valid UPI ID (e.g., yourname@upi)")
        return false
      }

      // Validate business postal code
      if (!/^\d{6}$/.test(formData.businessPostalCode)) {
        setError("Please enter a valid 6-digit business postal code")
        return false
      }
    }

    // Validate customer address if provided
    if (formData.role === "customer" && formData.addressLine1) {
      if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
        setError("Please enter a valid 6-digit postal code")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateForm()) {
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
        setRegistrationData(data)
        setSuccess(true)
        
        // Check if verification info is included and email was sent
        if (data.verification && data.verification.emailSent && data.verification.emailEnabled) {
          // Show verification message and redirect to verify-email page
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
          }, 3000)
        } else if (data.verification && data.verification.emailRequired) {
          // If email verification is required but email wasn't sent, stay on the page with error
          setError("Email verification is required but couldn't be sent. Please try again.")
          setSuccess(false)
          return
        } else {
          // Regular redirect to sign in if email verification is disabled or optional
          setTimeout(() => {
            router.push("/auth/signin")
          }, 2000)
        }
      } else {
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/customer/dashboard" })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign in with social provider.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")

    // Update password strength on password field change
    if (e.target.name === "password") {
      checkPasswordStrength(e.target.value)
    }
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
    const verification = registrationData?.verification
    const isEmailSent = verification?.emailSent
    const isEmailEnabled = verification?.emailEnabled
    const emailProvider = verification?.emailProvider
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Your {formData.role} account has been created successfully.
            </p>
            
            {isEmailEnabled && isEmailSent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-800">Email Verification</h3>
                </div>
                <p className="text-sm text-blue-700">
                  We&pos;ve sent a verification email to <strong>{formData.email}</strong>
                  {emailProvider === 'sendgrid' ? ' via SendGrid' : ' (check console for development)'}.
                  Please check your inbox and verify your email address.
                </p>
              </div>
            )}
            
            {isEmailEnabled && !isEmailSent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800">Email Verification</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  Email verification is enabled but we couldn&apos;t send the verification email. 
                  You can request a new verification email after signing in.
                </p>
              </div>
            )}
            
            {!isEmailEnabled && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Email Verification</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Email verification is currently disabled. You can start using your account immediately.
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-500">
              {isEmailSent && verification?.emailRequired 
                ? "Email verification is required. Redirecting to verification page..." 
                : isEmailSent
                  ? "Email verification is optional but recommended. Redirecting to verification page..."
                  : "Redirecting to sign in page..."}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Redirecting in a few seconds...
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
                
                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
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
                  {/* Password Strength Indicator */}
                  <div className="text-xs text-gray-500">
                    Password strength:{" "}
                    <span className={`font-semibold ${passwordStrength.score < 3 ? "text-red-600" : "text-green-600"}`}>
                      {passwordStrength.feedback}
                    </span>
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

              {/* Customer Address Fields */}
              {formData.role === "customer" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Address Information (Optional)</h3>
                  <p className="text-xs text-gray-500">You can add this later in your profile, or add it now for faster checkout</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (for delivery)</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Full name for delivery"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      type="text"
                      placeholder="House/Flat number, Building name"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      type="text"
                      placeholder="Street, Area, Colony"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      type="text"
                      placeholder="Near school, hospital, etc."
                      value={formData.landmark}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={formData.state} 
                        onValueChange={(value) => setFormData({...formData, state: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        placeholder="6-digit PIN code"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        maxLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender (Optional)</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => setFormData({...formData, gender: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Required Fields */}
              {formData.role === "vendor" && (
                <div className="space-y-6">
                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Business Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="businessName"
                            name="businessName"
                            type="text"
                            placeholder="Enter business name"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessCategory">Business Category *</Label>
                      <Select 
                        value={formData.businessCategory} 
                        onValueChange={(value) => setFormData({...formData, businessCategory: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion & Clothing</SelectItem>
                          <SelectItem value="home-garden">Home & Garden</SelectItem>
                          <SelectItem value="books">Books & Media</SelectItem>
                          <SelectItem value="sports">Sports & Outdoors</SelectItem>
                          <SelectItem value="health">Health & Beauty</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="toys">Toys & Games</SelectItem>
                          <SelectItem value="food">Food & Beverages</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number *</Label>
                      <Input
                        id="panNumber"
                        name="panNumber"
                        type="text"
                        placeholder="ABCDE1234F"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        className="uppercase"
                        maxLength={10}
                        required
                      />
                      <p className="text-xs text-gray-500">Required for tax compliance</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Business Address *</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessAddress">Address Line 1 *</Label>
                        <Input
                          id="businessAddress"
                          name="businessAddress"
                          type="text"
                          placeholder="Shop/Office number, Building name"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessCity">City *</Label>
                          <Input
                            id="businessCity"
                            name="businessCity"
                            type="text"
                            placeholder="Business city"
                            value={formData.businessCity}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessState">State *</Label>
                          <Select 
                            value={formData.businessState} 
                            onValueChange={(value) => setFormData({...formData, businessState: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessPostalCode">Postal Code *</Label>
                        <Input
                          id="businessPostalCode"
                          name="businessPostalCode"
                          type="text"
                          placeholder="6-digit PIN code"
                          value={formData.businessPostalCode}
                          onChange={handleInputChange}
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Payment Information</h3>
                    <p className="text-xs text-gray-500">Required for payment settlements</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID *</Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        type="text"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        required
                      />
                      <p className="text-xs text-gray-500">Used for payment settlements</p>
                    </div>
                  </div>

                  {/* Optional Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Additional Details (Optional)</h3>
                    <p className="text-xs text-gray-500">These can be updated later in your profile</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          name="gstNumber"
                          type="text"
                          placeholder="22AAAAA0000A1Z5"
                          value={formData.gstNumber}
                          onChange={handleInputChange}
                          className="uppercase"
                          maxLength={15}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessEmail">Business Email</Label>
                        <Input
                          id="businessEmail"
                          name="businessEmail"
                          type="email"
                          placeholder="business@example.com"
                          value={formData.businessEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Business Phone</Label>
                      <Input
                        id="businessPhone"
                        name="businessPhone"
                        type="tel"
                        placeholder="Business contact number"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer"
                disabled={loading}
                aria-busy={loading}
                aria-disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
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
                  Log in here
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  CheckCircle,
  Calendar as CalendarIcon,
  Key,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    // Basic fields (all roles)
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    role: "customer",
    
    // Verification preference
    verificationPreference: "email", // "email" or "mobile"
    
    // Admin specific field
    adminKey: "",
    
    // Address fields (customer and vendor)
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    
    // Customer specific fields
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    
    // Vendor specific fields - Required
    businessName: "",
    businessType: "",
    businessCategory: "",
    panNumber: "",
    upiId: "", // Required for payments
    
    // Vendor specific fields - Optional
    gstNumber: "",
    businessEmail: "",
    businessPhone: "",
    businessRegistrationNumber: "",
    yearEstablished: "",
    alternatePhone: ""
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

    if (!formData.mobileNo.trim()) {
      setError("Mobile number is required")
      return false
    }

    if (!/^\+?[1-9]\d{9,14}$/.test(formData.mobileNo.replace(/\s/g, ""))) {
      setError("Please enter a valid mobile number")
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
    if (formData.role === "admin") {
      if (!formData.adminKey.trim()) {
        setError("Admin registration key is required for admin accounts")
        return false
      }
    }

    if (formData.role === "vendor") {
      const requiredVendorFields = {
        businessName: "Business name",
        businessType: "Business type", 
        businessCategory: "Business category",
        panNumber: "PAN number",
        upiId: "UPI ID"
      }

      for (const [field, label] of Object.entries(requiredVendorFields)) {
        const value = formData[field as keyof typeof formData]
        if (!value || (typeof value === 'string' && !value.trim())) {
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
    }

    // Validate address postal code if provided
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      setError("Please enter a valid 6-digit postal code")
      return false
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
      // Prepare the data for the API
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        mobileNo: formData.mobileNo,
        role: formData.role,
        verificationPreference: formData.verificationPreference,
        // Admin specific field
        ...(formData.role === "admin" && {
          adminKey: formData.adminKey,
        }),
        // Customer specific fields
        ...(formData.role === "customer" && {
          dateOfBirth: formData.dateOfBirth?.toISOString() || undefined,
          gender: formData.gender || undefined,
        }),
        // Vendor specific fields
        ...(formData.role === "vendor" && {
          businessName: formData.businessName,
          businessType: formData.businessType,
          businessCategory: formData.businessCategory,
          panNumber: formData.panNumber,
          upiId: formData.upiId,
          gstNumber: formData.gstNumber || undefined,
          businessEmail: formData.businessEmail || undefined,
          businessPhone: formData.businessPhone || undefined,
          businessRegistrationNumber: formData.businessRegistrationNumber || undefined,
          yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
          alternatePhone: formData.alternatePhone || undefined,
        }),
        // Address fields (for both customer and vendor)
        ...(formData.addressLine1 && {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          landmark: formData.landmark || undefined,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        }),
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (response.ok) {
        setRegistrationData(data)
        setSuccess(true)
        
        // Redirect to verification page after 3 seconds
        setTimeout(() => {
          if (formData.verificationPreference === 'mobile') {
            router.push(`/auth/verify-mobile?email=${encodeURIComponent(formData.email)}&mobile=${encodeURIComponent(formData.mobileNo)}`)
          } else {
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
          }
        }, 3000)
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

  const handleDateSelect = (date: Date | undefined) => {
    setFormData({ ...formData, dateOfBirth: date })
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="text-center space-y-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-4">
                Welcome to ShopHub, {registrationData?.user?.firstName}!
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Check your email for verification code</li>
                  <li>• Check your mobile for SMS verification code</li>
                  {registrationData?.user?.role === 'vendor' && (
                    <li>• Your account is under review and will be activated soon</li>
                  )}
                  {registrationData?.user?.role === 'customer' && (
                    <li>• Start shopping after verification</li>
                  )}
                  {registrationData?.user?.role === 'admin' && (
                    <li>• You have full admin access after verification</li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to verification page in a few seconds...
              </p>
              <Button 
                onClick={() => {
                  if (formData.verificationPreference === 'mobile') {
                    router.push(`/auth/verify-mobile?email=${encodeURIComponent(formData.email)}&mobile=${encodeURIComponent(formData.mobileNo)}`)
                  } else {
                    router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Verify Now
              </Button>
            </div>
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

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNo">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobileNo"
                      name="mobileNo"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Verification Preference */}
                <div className="space-y-2">
                  <Label htmlFor="verificationPreference">Verification Method</Label>
                  <Select value={formData.verificationPreference} onValueChange={(value) => setFormData({ ...formData, verificationPreference: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose verification method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span>Email Verification</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <span>Mobile Verification</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Choose how you'd like to verify your account
                  </p>
                </div>

                {/* Admin Registration Key (only for admin role) */}
                {formData.role === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="adminKey">Admin Registration Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminKey"
                        name="adminKey"
                        type="password"
                        placeholder="Enter admin registration key"
                        value={formData.adminKey}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This key is required for admin account registration
                    </p>
                  </div>
                )}

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

              {/* Customer Specific Fields */}
              {formData.role === "customer" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
                  <p className="text-xs text-gray-500">
                    This information helps us personalize your shopping experience
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${!formData.dateOfBirth && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dateOfBirth ? format(formData.dateOfBirth, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.dateOfBirth}
                            onSelect={handleDateSelect}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            showOutsideDays={false}
                            className="rounded-md border"
                            classNames={{
                              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                              month: "space-y-4",
                              caption: "flex justify-center pt-1 relative items-center",
                              caption_label: "text-sm font-medium",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                              row: "flex w-full mt-2",
                              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                              day_today: "bg-accent text-accent-foreground",
                              day_outside: "text-muted-foreground opacity-50",
                              day_disabled: "text-muted-foreground opacity-50",
                              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                              day_hidden: "invisible",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
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

              {/* Address Fields (for both Customer and Vendor) */}
              {(formData.role === "customer" || formData.role === "vendor") && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {formData.role === "customer" ? "Address Information (Optional)" : "Business Address (Optional)"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formData.role === "customer" 
                      ? "You can add this later in your profile, or add it now for faster checkout"
                      : "Add your business address for registration and shipping purposes"
                    }
                  </p>

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
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="private_limited">Private Limited</SelectItem>
                            <SelectItem value="public_limited">Public Limited</SelectItem>
                            <SelectItem value="llp">LLP</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="wholesale">Wholesale</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
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

                    {/* Note: Address is handled in the shared address section above */}
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

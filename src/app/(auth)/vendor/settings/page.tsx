"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Building, MapPin, CreditCard, Settings, User, TrendingUp } from "lucide-react"
import MobileVerification from "@/components/mobile-verification" 

interface VendorData {
  _id: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth?: string
  }
  businessInfo: {
    businessName: string
    businessType: string
    description: string
    website?: string
    email: string
    phone: string
    gstNumber?: string
    panNumber: string
    category: string
    registrationNumber?: string
  }
  address: {
    businessAddress: {
      addressLine1: string
      addressLine2?: string
      city: string
      state: string
      pincode: string
      country: string
      landmark?: string
    }
    pickupAddress: {
      addressLine1: string
      addressLine2?: string
      city: string
      state: string
      pincode: string
      country: string
      landmark?: string
    }
  }
  paymentInfo: {
    upiId: string
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      orderAlerts: boolean
      inventoryAlerts: boolean
    }
    businessHours: {
      open: string
      close: string
      daysOfWeek: string[]
    }
  }
  performance: {
    rating: number
    totalOrders: number
    completedOrders: number
    revenue: number
    returnsRate: number
  }
  isActive: boolean
}

export default function VendorSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [vendorData, setVendorData] = useState<VendorData | null>(null)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "vendor") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchVendorData()
    }
  }, [status, session, router, fetchVendorData])

  const fetchVendorData = async () => {
    try {
      const response = await fetch(`/api/vendor?id=${(session?.user as { id?: string })?.id}`)
      if (response.ok) {
        const data = await response.json()
        setVendorData(data.vendors[0])
      } else {
        toast.error("Failed to load vendor data")
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
      toast.error("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const updatePersonalInfo = async (updatedInfo: Record<string, unknown>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vendor/${(session?.user as { id?: string })?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalInfo: updatedInfo }),
      })

      if (response.ok) {
        toast.success("Personal information updated successfully")
        fetchVendorData()
      } else {
        toast.error("Failed to update personal information")
      }
    } catch (error) {
      console.error("Error updating personal info:", error)
      toast.error("Error updating information")
    } finally {
      setSaving(false)
    }
  }

  const updateBusinessInfo = async (updatedInfo: Record<string, unknown>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vendor/${(session?.user as { id?: string })?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo: updatedInfo }),
      })

      if (response.ok) {
        toast.success("Business information updated successfully")
        fetchVendorData()
      } else {
        toast.error("Failed to update business information")
      }
    } catch (error) {
      console.error("Error updating business info:", error)
      toast.error("Error updating information")
    } finally {
      setSaving(false)
    }
  }

  const updateAddresses = async (updatedAddresses: Record<string, unknown>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vendor/${(session?.user as { id?: string })?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: updatedAddresses }),
      })

      if (response.ok) {
        toast.success("Addresses updated successfully")
        fetchVendorData()
      } else {
        toast.error("Failed to update addresses")
      }
    } catch (error) {
      console.error("Error updating addresses:", error)
      toast.error("Error updating addresses")
    } finally {
      setSaving(false)
    }
  }

  const updatePaymentInfo = async (updatedPayment: Record<string, unknown>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vendor/${(session?.user as { id?: string })?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentInfo: updatedPayment }),
      })

      if (response.ok) {
        toast.success("Payment information updated successfully")
        fetchVendorData()
      } else {
        toast.error("Failed to update payment information")
      }
    } catch (error) {
      console.error("Error updating payment info:", error)
      toast.error("Error updating payment information")
    } finally {
      setSaving(false)
    }
  }

  const updatePreferences = async (updatedPrefs: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vendor/${(session?.user as any)?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: updatedPrefs }),
      })

      if (response.ok) {
        toast.success("Preferences updated successfully")
        fetchVendorData()
      } else {
        toast.error("Failed to update preferences")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Error updating preferences")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Vendor data not found</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendor Settings</h1>
        <p className="text-gray-600">Manage your business profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { id: "profile", label: "Personal Info", icon: User },
              { id: "business", label: "Business Info", icon: Building },
              { id: "addresses", label: "Addresses", icon: MapPin },
              { id: "payment", label: "Payment Details", icon: CreditCard },
              { id: "preferences", label: "Preferences", icon: Settings },
              { id: "performance", label: "Performance", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Personal Information Tab */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={vendorData.personalInfo.firstName}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          personalInfo: {
                            ...vendorData.personalInfo,
                            firstName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={vendorData.personalInfo.lastName}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          personalInfo: {
                            ...vendorData.personalInfo,
                            lastName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={vendorData.personalInfo.email}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          personalInfo: {
                            ...vendorData.personalInfo,
                            email: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={vendorData.personalInfo.phone}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          personalInfo: {
                            ...vendorData.personalInfo,
                            phone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                
                <div className="mt-6">
                  <Label className="text-base font-medium">Mobile Verification</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Verify your mobile number to secure your account and receive important notifications
                  </p>
                  <MobileVerification 
                    initialPhoneNumber={vendorData.personalInfo.phone}
                    onVerificationComplete={() => {
                      toast.success("Mobile number verified successfully!")
                      fetchVendorData()
                    }}
                  />
                </div>
               

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={vendorData.personalInfo.dateOfBirth || ""}
                    onChange={(e) =>
                      setVendorData({
                        ...vendorData,
                        personalInfo: {
                          ...vendorData.personalInfo,
                          dateOfBirth: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <Button
                  onClick={() => updatePersonalInfo(vendorData.personalInfo)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Business Information Tab */}
          {activeTab === "business" && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={vendorData.businessInfo.businessName}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            businessName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={vendorData.businessInfo.businessType}
                      onValueChange={(value) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            businessType: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="proprietorship">Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="llp">LLP</SelectItem>
                        <SelectItem value="pvt_ltd">Private Limited</SelectItem>
                        <SelectItem value="public_ltd">Public Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={vendorData.businessInfo.description}
                    onChange={(e) =>
                      setVendorData({
                        ...vendorData,
                        businessInfo: {
                          ...vendorData.businessInfo,
                          description: e.target.value,
                        },
                      })
                    }
                    rows={4}
                    placeholder="Describe your business..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={vendorData.businessInfo.website || ""}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            website: e.target.value,
                          },
                        })
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={vendorData.businessInfo.category}
                      onValueChange={(value) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            category: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="fashion">Fashion & Clothing</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="books">Books & Media</SelectItem>
                        <SelectItem value="sports">Sports & Fitness</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="health">Health & Beauty</SelectItem>
                        <SelectItem value="toys">Toys & Games</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={vendorData.businessInfo.email}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            email: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      value={vendorData.businessInfo.phone}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            phone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={vendorData.businessInfo.panNumber}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            panNumber: e.target.value.toUpperCase(),
                          },
                        })
                      }
                      placeholder="ABCDE1234F"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input
                      id="gstNumber"
                      value={vendorData.businessInfo.gstNumber || ""}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          businessInfo: {
                            ...vendorData.businessInfo,
                            gstNumber: e.target.value.toUpperCase(),
                          },
                        })
                      }
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => updateBusinessInfo(vendorData.businessInfo)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              {/* Business Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Address</CardTitle>
                  <CardDescription>Your registered business address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessAddressLine1">Address Line 1</Label>
                    <Input
                      id="businessAddressLine1"
                      value={vendorData.address.businessAddress.addressLine1}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          address: {
                            ...vendorData.address,
                            businessAddress: {
                              ...vendorData.address.businessAddress,
                              addressLine1: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Building, Street"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessAddressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="businessAddressLine2"
                      value={vendorData.address.businessAddress.addressLine2 || ""}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          address: {
                            ...vendorData.address,
                            businessAddress: {
                              ...vendorData.address.businessAddress,
                              addressLine2: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Area, Locality"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="businessCity">City</Label>
                      <Input
                        id="businessCity"
                        value={vendorData.address.businessAddress.city}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            address: {
                              ...vendorData.address,
                              businessAddress: {
                                ...vendorData.address.businessAddress,
                                city: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessState">State</Label>
                      <Input
                        id="businessState"
                        value={vendorData.address.businessAddress.state}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            address: {
                              ...vendorData.address,
                              businessAddress: {
                                ...vendorData.address.businessAddress,
                                state: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessPincode">Pincode</Label>
                      <Input
                        id="businessPincode"
                        value={vendorData.address.businessAddress.pincode}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            address: {
                              ...vendorData.address,
                              businessAddress: {
                                ...vendorData.address.businessAddress,
                                pincode: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Address</CardTitle>
                  <CardDescription>Address for order pickups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pickupAddressLine1">Address Line 1</Label>
                    <Input
                      id="pickupAddressLine1"
                      value={vendorData.address.pickupAddress.addressLine1}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          address: {
                            ...vendorData.address,
                            pickupAddress: {
                              ...vendorData.address.pickupAddress,
                              addressLine1: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Building, Street"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pickupAddressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="pickupAddressLine2"
                      value={vendorData.address.pickupAddress.addressLine2 || ""}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          address: {
                            ...vendorData.address,
                            pickupAddress: {
                              ...vendorData.address.pickupAddress,
                              addressLine2: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Area, Locality"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="pickupCity">City</Label>
                      <Input
                        id="pickupCity"
                        value={vendorData.address.pickupAddress.city}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            address: {
                              ...vendorData.address,
                              pickupAddress: {
                                ...vendorData.address.pickupAddress,
                                city: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickupState">State</Label>
                      <Input
                        id="pickupState"
                        value={vendorData.address.pickupAddress.state}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            address: {
                              ...vendorData.address,
                              pickupAddress: {
                                ...vendorData.address.pickupAddress,
                                state: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickupPincode">Pincode</Label>
                      <Input
                        id="pickupPincode"
                        value={vendorData.address.pickupAddress.pincode}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            address: {
                              ...vendorData.address,
                              pickupAddress: {
                                ...vendorData.address.pickupAddress,
                                pincode: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => updateAddresses(vendorData.address)}
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Addresses
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Details Tab */}
          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Manage your payout details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={vendorData.paymentInfo.upiId}
                    onChange={(e) =>
                      setVendorData({
                        ...vendorData,
                        paymentInfo: {
                          ...vendorData.paymentInfo,
                          upiId: e.target.value,
                        },
                      })
                    }
                    placeholder="yourname@paytm"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    We only support UPI payments for vendor settlements
                  </p>
                </div>

                <Button
                  onClick={() => updatePaymentInfo(vendorData.paymentInfo)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Payment Info
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>Business Preferences</CardTitle>
                <CardDescription>Configure your business settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive order and business updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={vendorData.preferences.notifications.email}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            preferences: {
                              ...vendorData.preferences,
                              notifications: {
                                ...vendorData.preferences.notifications,
                                email: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderAlerts">Order Alerts</Label>
                        <p className="text-sm text-gray-600">Get notified immediately when new orders arrive</p>
                      </div>
                      <input
                        type="checkbox"
                        id="orderAlerts"
                        checked={vendorData.preferences.notifications.orderAlerts}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            preferences: {
                              ...vendorData.preferences,
                              notifications: {
                                ...vendorData.preferences.notifications,
                                orderAlerts: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                        <p className="text-sm text-gray-600">Get alerts when stock levels are low</p>
                      </div>
                      <input
                        type="checkbox"
                        id="inventoryAlerts"
                        checked={vendorData.preferences.notifications.inventoryAlerts}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            preferences: {
                              ...vendorData.preferences,
                              notifications: {
                                ...vendorData.preferences.notifications,
                                inventoryAlerts: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Business Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openTime">Opening Time</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={vendorData.preferences.businessHours.open}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            preferences: {
                              ...vendorData.preferences,
                              businessHours: {
                                ...vendorData.preferences.businessHours,
                                open: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeTime">Closing Time</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={vendorData.preferences.businessHours.close}
                        onChange={(e) =>
                          setVendorData({
                            ...vendorData,
                            preferences: {
                              ...vendorData.preferences,
                              businessHours: {
                                ...vendorData.preferences.businessHours,
                                close: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updatePreferences(vendorData.preferences)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>View your business performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-900">
                      {vendorData.performance.rating.toFixed(1)}
                    </h3>
                    <p className="text-blue-700">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-900">
                      {vendorData.performance.totalOrders}
                    </h3>
                    <p className="text-green-700">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-900">
                      ₹{vendorData.performance.revenue.toLocaleString()}
                    </h3>
                    <p className="text-purple-700">Revenue</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-orange-900">
                      {(vendorData.performance.returnsRate * 100).toFixed(1)}%
                    </h3>
                    <p className="text-orange-700">Return Rate</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Status</h4>
                    <p className="text-sm text-gray-600">Your vendor account is currently active</p>
                  </div>
                  <Badge variant={vendorData.isActive ? "default" : "destructive"}>
                    {vendorData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

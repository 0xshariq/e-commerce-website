"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, MapPin, CreditCard, Bell, Shield, User, Trash2, Plus, Edit2 } from "lucide-react"
// import MobileVerification from "@/components/mobile-verification" // Uncomment when needed

interface CustomerData {
  _id: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth?: string
    gender?: string
  }
  addresses: Array<{
    _id: string
    type: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    country: string
    landmark?: string
    isDefault: boolean
  }>
  paymentMethods: Array<{
    _id: string
    type: string
    upiId?: string
    isDefault: boolean
  }>
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    language: string
    currency: string
  }
  loyaltyProgram: {
    points: number
    tier: string
  }
}

export default function CustomerSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [newAddress, setNewAddress] = useState({
    type: "home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    landmark: "",
    isDefault: false,
  })
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "upi",
    upiId: "",
    isDefault: false,
  })

  const fetchCustomerData = useCallback(async () => {
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setCustomerData(data.customer)
      } else {
        toast.error("Failed to load customer data")
      }
    } catch (error) {
      console.error("Error fetching customer data:", error)
      toast.error("Error loading data")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "customer") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchCustomerData()
    }
  }, [status, session, router, fetchCustomerData])

  const updatePersonalInfo = async (updatedInfo: Partial<CustomerData['personalInfo']>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalInfo: updatedInfo }),
      })

      if (response.ok) {
        toast.success("Personal information updated successfully")
        fetchCustomerData()
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

  const addAddress = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      })

      if (response.ok) {
        toast.success("Address added successfully")
        setNewAddress({
          type: "home",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          landmark: "",
          isDefault: false,
        })
        fetchCustomerData()
      } else {
        toast.error("Failed to add address")
      }
    } catch (error) {
      console.error("Error adding address:", error)
      toast.error("Error adding address")
    } finally {
      setSaving(false)
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Address deleted successfully")
        fetchCustomerData()
      } else {
        toast.error("Failed to delete address")
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Error deleting address")
    }
  }

  const addPaymentMethod = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPaymentMethod),
      })

      if (response.ok) {
        toast.success("Payment method added successfully")
        setNewPaymentMethod({
          type: "upi",
          upiId: "",
          isDefault: false,
        })
        fetchCustomerData()
      } else {
        toast.error("Failed to add payment method")
      }
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast.error("Error adding payment method")
    } finally {
      setSaving(false)
    }
  }

  const updatePreferences = async (updatedPrefs: Partial<CustomerData['preferences']>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: updatedPrefs }),
      })

      if (response.ok) {
        toast.success("Preferences updated successfully")
        fetchCustomerData()
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

  if (!customerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Customer data not found</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { id: "profile", label: "Personal Info", icon: User },
              { id: "addresses", label: "Addresses", icon: MapPin },
              { id: "payments", label: "Payment Methods", icon: CreditCard },
              { id: "preferences", label: "Preferences", icon: Bell },
              { id: "security", label: "Security", icon: Shield },
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
                      value={customerData.personalInfo.firstName}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          personalInfo: {
                            ...customerData.personalInfo,
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
                      value={customerData.personalInfo.lastName}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          personalInfo: {
                            ...customerData.personalInfo,
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
                      value={customerData.personalInfo.email}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          personalInfo: {
                            ...customerData.personalInfo,
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
                      value={customerData.personalInfo.phone}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          personalInfo: {
                            ...customerData.personalInfo,
                            phone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Mobile Verification - Optional */}
                {/* Uncomment when Twilio configuration is ready */}
                {/* 
                <div className="mt-4">
                  <MobileVerification initialPhoneNumber={customerData.personalInfo.phone} />
                </div>
                */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={customerData.personalInfo.dateOfBirth || ""}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          personalInfo: {
                            ...customerData.personalInfo,
                            dateOfBirth: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={customerData.personalInfo.gender || ""}
                      onValueChange={(value) =>
                        setCustomerData({
                          ...customerData,
                          personalInfo: {
                            ...customerData.personalInfo,
                            gender: value,
                          },
                        })
                      }
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

                <Button
                  onClick={() => updatePersonalInfo(customerData.personalInfo)}
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
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>Manage your shipping addresses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerData.addresses.map((address) => (
                      <div
                        key={address._id}
                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={address.type === "home" ? "default" : "secondary"}>
                              {address.type.toUpperCase()}
                            </Badge>
                            {address.isDefault && <Badge variant="outline">DEFAULT</Badge>}
                          </div>
                          <p className="text-sm">
                            {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && (
                            <p className="text-sm text-gray-600">Near: {address.landmark}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAddress(address._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add New Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="addressType">Address Type</Label>
                      <Select
                        value={newAddress.type}
                        onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      placeholder="House/Flat No., Building, Street"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      placeholder="Area, Colony, Locality"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      placeholder="Nearby landmark"
                    />
                  </div>

                  <Button onClick={addAddress} disabled={saving} className="w-full md:w-auto">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Address
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerData.paymentMethods.map((method) => (
                      <div
                        key={method._id}
                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">
                              {method.type.toUpperCase()}: {method.upiId}
                            </p>
                            {method.isDefault && (
                              <Badge variant="outline" className="mt-1">
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add New Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select
                      value={newPaymentMethod.type}
                      onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      value={newPaymentMethod.upiId}
                      onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, upiId: e.target.value })}
                      placeholder="yourname@paytm"
                    />
                  </div>

                  <Button onClick={addPaymentMethod} disabled={saving} className="w-full md:w-auto">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive order updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={customerData.preferences.emailNotifications}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            preferences: {
                              ...customerData.preferences,
                              emailNotifications: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={customerData.preferences.smsNotifications}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            preferences: {
                              ...customerData.preferences,
                              smsNotifications: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={customerData.preferences.language}
                      onValueChange={(value) =>
                        setCustomerData({
                          ...customerData,
                          preferences: {
                            ...customerData.preferences,
                            language: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="bn">Bengali</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={customerData.preferences.currency}
                      onValueChange={(value) =>
                        setCustomerData({
                          ...customerData,
                          preferences: {
                            ...customerData.preferences,
                            currency: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => updatePreferences(customerData.preferences)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Loyalty Program</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-bold text-blue-900">
                          {customerData.loyaltyProgram.points} Points
                        </h4>
                        <p className="text-blue-700">
                          Tier: {customerData.loyaltyProgram.tier.toUpperCase()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download Account Data
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Shield, Settings, User, Database, Bell, Lock, Activity, Store, CreditCard, TrendingUp } from "lucide-react"
// import MobileVerification from "@/components/mobile-verification" // Uncomment when needed

interface AdminData {
  _id: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  systemSettings: {
    siteName: string
    siteDescription: string
    siteUrl: string
    supportEmail: string
    maintenanceMode: boolean
    allowNewRegistrations: boolean
    requireEmailVerification: boolean
    maxFileUploadSize: number
    sessionTimeout: number
  }
  securitySettings: {
    twoFactorEnabled: boolean
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    loginAttempts: {
      maxAttempts: number
      lockoutDuration: number
    }
  }
  notificationSettings: {
    emailNotifications: boolean
    systemAlerts: boolean
    userRegistrationAlerts: boolean
    orderAlerts: boolean
    vendorApplicationAlerts: boolean
  }
  permissions: {
    manageUsers: boolean
    manageVendors: boolean
    manageProducts: boolean
    manageOrders: boolean
    managePayments: boolean
    viewAnalytics: boolean
    systemSettings: boolean
  }
  lastLogin: string
  isActive: boolean
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [activeTab, setActiveTab] = useState("profile")

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAdminData(data.admin)
      } else {
        toast.error("Failed to load admin data")
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
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

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchAdminData()
    }
  }, [status, session, router, fetchAdminData])

  const updatePersonalInfo = async (updatedInfo: Partial<AdminData['personalInfo']>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalInfo: updatedInfo }),
      })

      if (response.ok) {
        toast.success("Personal information updated successfully")
        fetchAdminData()
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

  const updateSystemSettings = async (updatedSettings: Partial<AdminData['systemSettings']>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/system-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        toast.success("System settings updated successfully")
        fetchAdminData()
      } else {
        toast.error("Failed to update system settings")
      }
    } catch (error) {
      console.error("Error updating system settings:", error)
      toast.error("Error updating settings")
    } finally {
      setSaving(false)
    }
  }

  const updateSecuritySettings = async (updatedSettings: Partial<AdminData['securitySettings']>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/security-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        toast.success("Security settings updated successfully")
        fetchAdminData()
      } else {
        toast.error("Failed to update security settings")
      }
    } catch (error) {
      console.error("Error updating security settings:", error)
      toast.error("Error updating settings")
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationSettings = async (updatedSettings: Partial<AdminData['notificationSettings']>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/notification-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        toast.success("Notification settings updated successfully")
        fetchAdminData()
      } else {
        toast.error("Failed to update notification settings")
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast.error("Error updating settings")
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

  if (!adminData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Admin data not found</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-600">Manage system settings and administrator preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { id: "profile", label: "Personal Info", icon: User },
              { id: "system", label: "System Settings", icon: Settings },
              { id: "security", label: "Security", icon: Shield },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "permissions", label: "Permissions", icon: Lock },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-red-50 text-red-700 border border-red-200"
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
                <CardDescription>Update your administrator profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={adminData.personalInfo.firstName}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          personalInfo: {
                            ...adminData.personalInfo,
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
                      value={adminData.personalInfo.lastName}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          personalInfo: {
                            ...adminData.personalInfo,
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
                      value={adminData.personalInfo.email}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          personalInfo: {
                            ...adminData.personalInfo,
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
                      value={adminData.personalInfo.phone}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          personalInfo: {
                            ...adminData.personalInfo,
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
                  <MobileVerification initialPhoneNumber={adminData.personalInfo.phone} />
                </div>
                */}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Account Status</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-blue-700">Super Administrator</p>
                    <Badge variant={adminData.isActive ? "default" : "destructive"}>
                      {adminData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Last login: {new Date(adminData.lastLogin).toLocaleString()}
                  </p>
                </div>

                <Button
                  onClick={() => updatePersonalInfo(adminData.personalInfo)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* System Settings Tab */}
          {activeTab === "system" && (
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage global system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={adminData.systemSettings.siteName}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          systemSettings: {
                            ...adminData.systemSettings,
                            siteName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={adminData.systemSettings.siteUrl}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          systemSettings: {
                            ...adminData.systemSettings,
                            siteUrl: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={adminData.systemSettings.siteDescription}
                    onChange={(e) =>
                      setAdminData({
                        ...adminData,
                        systemSettings: {
                          ...adminData.systemSettings,
                          siteDescription: e.target.value,
                        },
                      })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={adminData.systemSettings.supportEmail}
                    onChange={(e) =>
                      setAdminData({
                        ...adminData,
                        systemSettings: {
                          ...adminData.systemSettings,
                          supportEmail: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                    <Input
                      id="maxFileUploadSize"
                      type="number"
                      value={adminData.systemSettings.maxFileUploadSize}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          systemSettings: {
                            ...adminData.systemSettings,
                            maxFileUploadSize: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={adminData.systemSettings.sessionTimeout}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          systemSettings: {
                            ...adminData.systemSettings,
                            sessionTimeout: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Registration & Access</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Temporarily disable public access</p>
                      </div>
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={adminData.systemSettings.maintenanceMode}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            systemSettings: {
                              ...adminData.systemSettings,
                              maintenanceMode: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowNewRegistrations">Allow New Registrations</Label>
                        <p className="text-sm text-gray-600">Allow new users to register</p>
                      </div>
                      <input
                        type="checkbox"
                        id="allowNewRegistrations"
                        checked={adminData.systemSettings.allowNewRegistrations}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            systemSettings: {
                              ...adminData.systemSettings,
                              allowNewRegistrations: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                        <p className="text-sm text-gray-600">New users must verify their email</p>
                      </div>
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        checked={adminData.systemSettings.requireEmailVerification}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            systemSettings: {
                              ...adminData.systemSettings,
                              requireEmailVerification: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updateSystemSettings(adminData.systemSettings)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save System Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Settings Tab */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>Manage platform security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Enable 2FA for enhanced security</p>
                    </div>
                    <input
                      type="checkbox"
                      id="twoFactorEnabled"
                      checked={adminData.securitySettings.twoFactorEnabled}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          securitySettings: {
                            ...adminData.securitySettings,
                            twoFactorEnabled: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password Policy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        min="6"
                        max="50"
                        value={adminData.securitySettings.passwordPolicy.minLength}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            securitySettings: {
                              ...adminData.securitySettings,
                              passwordPolicy: {
                                ...adminData.securitySettings.passwordPolicy,
                                minLength: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: "requireUppercase", label: "Require Uppercase Letters" },
                      { key: "requireLowercase", label: "Require Lowercase Letters" },
                      { key: "requireNumbers", label: "Require Numbers" },
                      { key: "requireSpecialChars", label: "Require Special Characters" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={Boolean(adminData.securitySettings.passwordPolicy[item.key as keyof typeof adminData.securitySettings.passwordPolicy])}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              securitySettings: {
                                ...adminData.securitySettings,
                                passwordPolicy: {
                                  ...adminData.securitySettings.passwordPolicy,
                                  [item.key]: e.target.checked,
                                },
                              },
                            })
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Login Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        min="3"
                        max="10"
                        value={adminData.securitySettings.loginAttempts.maxAttempts}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            securitySettings: {
                              ...adminData.securitySettings,
                              loginAttempts: {
                                ...adminData.securitySettings.loginAttempts,
                                maxAttempts: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        min="5"
                        max="60"
                        value={adminData.securitySettings.loginAttempts.lockoutDuration}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            securitySettings: {
                              ...adminData.securitySettings,
                              loginAttempts: {
                                ...adminData.securitySettings.loginAttempts,
                                lockoutDuration: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updateSecuritySettings(adminData.securitySettings)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: "emailNotifications", label: "Email Notifications", description: "Receive system notifications via email" },
                    { key: "systemAlerts", label: "System Alerts", description: "Critical system alerts and errors" },
                    { key: "userRegistrationAlerts", label: "User Registration Alerts", description: "Notify when new users register" },
                    { key: "orderAlerts", label: "Order Alerts", description: "Notify about new orders and order issues" },
                    { key: "vendorApplicationAlerts", label: "Vendor Application Alerts", description: "Notify when vendors apply to join" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={item.key}>{item.label}</Label>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        id={item.key}
                        checked={adminData.notificationSettings[item.key as keyof typeof adminData.notificationSettings]}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            notificationSettings: {
                              ...adminData.notificationSettings,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => updateNotificationSettings(adminData.notificationSettings)}
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Permissions Tab */}
          {activeTab === "permissions" && (
            <Card>
              <CardHeader>
                <CardTitle>Administrator Permissions</CardTitle>
                <CardDescription>Current permissions for this admin account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "manageUsers", label: "Manage Users", icon: User },
                    { key: "manageVendors", label: "Manage Vendors", icon: Store },
                    { key: "manageProducts", label: "Manage Products", icon: Database },
                    { key: "manageOrders", label: "Manage Orders", icon: Activity },
                    { key: "managePayments", label: "Manage Payments", icon: CreditCard },
                    { key: "viewAnalytics", label: "View Analytics", icon: TrendingUp },
                    { key: "systemSettings", label: "System Settings", icon: Settings },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-gray-600" />
                        <Label>{item.label}</Label>
                      </div>
                      <Badge variant={adminData.permissions[item.key as keyof typeof adminData.permissions] ? "default" : "secondary"}>
                        {adminData.permissions[item.key as keyof typeof adminData.permissions] ? "Granted" : "Denied"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900">Super Administrator</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    As a super administrator, you have full access to all system functions. 
                    Permissions cannot be modified for super admin accounts.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>Monitor your administrator account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-900">Active</h3>
                    <p className="text-blue-700">Account Status</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-900">
                      {new Date(adminData.lastLogin).toLocaleDateString()}
                    </h3>
                    <p className="text-green-700">Last Login</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-900">Super</h3>
                    <p className="text-purple-700">Admin Level</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      View Activity Log
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Export System Data
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

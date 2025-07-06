"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Shield, Settings, User, Database, Globe, Bell, Lock, Activity, Phone } from "lucide-react"
import MobileVerification from "@/components/mobile-verification"

interface AdminSettingsContentProps {
  adminData: any
}

export default function AdminSettingsContent({ adminData }: AdminSettingsContentProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    name: adminData?.name || "",
    email: adminData?.email || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [systemSettings, setSystemSettings] = useState({
    siteName: "ShopHub",
    siteDescription: "Your trusted e-commerce platform",
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: false,
    maxFileUploadSize: 10,
    sessionTimeout: 60,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 15,
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSystemSettingChange = (field: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSecuritySettingChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success("Password changed successfully")
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      } else {
        throw new Error("Failed to change password")
      }
    } catch (error) {
      toast.error("Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(systemSettings),
      })

      if (response.ok) {
        toast.success("System settings updated successfully")
      } else {
        throw new Error("Failed to update system settings")
      }
    } catch (error) {
      toast.error("Failed to update system settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecuritySettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/security-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(securitySettings),
      })

      if (response.ok) {
        toast.success("Security settings updated successfully")
      } else {
        throw new Error("Failed to update security settings")
      }
    } catch (error) {
      toast.error("Failed to update security settings")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
        <p className="text-gray-400">Manage your account and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Mobile Verification */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <MobileVerification 
              showTitle={true}
              onVerificationComplete={(phone) => {
                handleInputChange("phone", phone)
                toast.success("Mobile number verified successfully")
              }}
            />
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="grid gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-gray-400">
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure security options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => 
                    handleSecuritySettingChange("twoFactorEnabled", checked)
                  }
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <Label className="text-gray-300">Password Policy</Label>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Minimum Length</span>
                    <Select
                      value={securitySettings.passwordPolicy.minLength.toString()}
                      onValueChange={(value) => 
                        handleSecuritySettingChange("passwordPolicy", {
                          ...securitySettings.passwordPolicy,
                          minLength: parseInt(value)
                        })
                      }
                    >
                      <SelectTrigger className="w-20 bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Require Uppercase</span>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => 
                        handleSecuritySettingChange("passwordPolicy", {
                          ...securitySettings.passwordPolicy,
                          requireUppercase: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Require Numbers</span>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => 
                        handleSecuritySettingChange("passwordPolicy", {
                          ...securitySettings.passwordPolicy,
                          requireNumbers: checked
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSecuritySettings} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Security Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Configuration</CardTitle>
            <CardDescription className="text-gray-400">
              Configure platform-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Site Name</Label>
                <Input
                  value={systemSettings.siteName}
                  onChange={(e) => handleSystemSettingChange("siteName", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Max File Upload (MB)</Label>
                <Select
                  value={systemSettings.maxFileUploadSize.toString()}
                  onValueChange={(value) => 
                    handleSystemSettingChange("maxFileUploadSize", parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 MB</SelectItem>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="20">20 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Site Description</Label>
              <Textarea
                value={systemSettings.siteDescription}
                onChange={(e) => handleSystemSettingChange("siteDescription", e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Temporarily disable site access</p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => 
                    handleSystemSettingChange("maintenanceMode", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">New Registrations</Label>
                  <p className="text-sm text-gray-500">Allow new user signups</p>
                </div>
                <Switch
                  checked={systemSettings.allowNewRegistrations}
                  onCheckedChange={(checked) => 
                    handleSystemSettingChange("allowNewRegistrations", checked)
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveSystemSettings} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save System Settings"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Notification Preferences</CardTitle>
            <CardDescription className="text-gray-400">
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive critical alerts via SMS</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">System Alerts</Label>
                  <p className="text-sm text-gray-500">Server status and maintenance alerts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Order Notifications</Label>
                  <p className="text-sm text-gray-500">New orders and payment alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Button disabled={loading}>
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

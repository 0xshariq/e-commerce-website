"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Edit,
  Key,
  Activity,
  Users,
  Store,
  AlertTriangle,
  Camera,
  Phone,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  Settings,
  TrendingUp,
  Package,
  Clock,
  UserCheck,
} from "lucide-react";
import { formatDate, formatNumber } from "@/utils/formatting";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  mobileNo?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  profileImage?: string;
  permissions: string[];
  stats?: {
    totalUsers: number;
    totalVendors: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    pendingApprovals: number;
    systemIssues: number;
    recentActions: number;
  };
}

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "admin") {
      router.push("/auth/signin");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setError("");

      const updateData = {
        name: profile.name,
        mobileNo: profile.mobileNo,
      };

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load profile data. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Admin Profile
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your administrator account and system settings
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                  <AvatarImage src={profile.profileImage || ""} alt={profile.name} />
                  <AvatarFallback className="bg-purple-600 text-white text-xl sm:text-2xl">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg sm:text-xl">{profile.name}</CardTitle>
              <CardDescription className="text-sm break-all">{profile.email}</CardDescription>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant="outline" className="border-purple-600 text-purple-600">
                  <Shield className="h-3 w-3 mr-1" />
                  ADMINISTRATOR
                </Badge>
                {profile.isEmailVerified && (
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    EMAIL VERIFIED
                  </Badge>
                )}
                {profile.isMobileVerified && (
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    MOBILE VERIFIED
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Button>
              {profile.stats && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-600">
                      {formatNumber(profile.stats.totalUsers)}
                    </div>
                    <div className="text-xs text-gray-600">Users</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">
                      {formatNumber(profile.stats.totalVendors)}
                    </div>
                    <div className="text-xs text-gray-600">Vendors</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
                <CardDescription className="text-sm">
                  Update your administrator details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        value={profile.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email || ""}
                        className="pl-10 bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mobile"
                      type="tel"
                      value={profile.mobileNo || ""}
                      onChange={(e) => handleInputChange("mobileNo", e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* System Statistics */}
            {profile.stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">System Overview</CardTitle>
                  <CardDescription className="text-sm">Platform statistics and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center bg-blue-50 rounded-lg p-4">
                      <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {formatNumber(profile.stats.totalUsers)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-4">
                      <Store className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatNumber(profile.stats.totalVendors)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Vendors</div>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-4">
                      <UserCheck className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {formatNumber(profile.stats.totalCustomers)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Customers</div>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-4">
                      <Package className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-orange-600">
                        {formatNumber(profile.stats.totalProducts)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Products</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center bg-indigo-50 rounded-lg p-4">
                      <TrendingUp className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                        {formatNumber(profile.stats.totalOrders)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center bg-yellow-50 rounded-lg p-4">
                      <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {formatNumber(profile.stats.pendingApprovals)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center bg-red-50 rounded-lg p-4">
                      <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {formatNumber(profile.stats.systemIssues)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Issues</div>
                    </div>
                    <div className="text-center bg-teal-50 rounded-lg p-4">
                      <Activity className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-teal-600">
                        {formatNumber(profile.stats.recentActions)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Recent Actions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Shield className="h-5 w-5" />
                  Security & Administration
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your admin account security and system access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Keep your admin account secure with a strong password
                    </p>
                  </div>
                  <Button variant="outline" className="text-sm">
                    Change Password
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Two-Factor Authentication</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Enhanced security for administrator access
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white w-fit">Enabled</Badge>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Admin Registration Key</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Manage admin registration access control
                    </p>
                  </div>
                  <Button variant="outline" className="text-sm">
                    <Key className="h-4 w-4 mr-2" />
                    Regenerate Key
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Session Management</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Monitor and manage active admin sessions
                    </p>
                  </div>
                  <Button variant="outline" className="text-sm">
                    <Activity className="h-4 w-4 mr-2" />
                    View Sessions
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">System Configuration</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Access advanced system settings and configurations
                    </p>
                  </div>
                  <Button variant="outline" className="text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

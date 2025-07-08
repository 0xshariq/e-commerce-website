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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  User,
  Edit,
  Shield,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Star,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { formatDate, formatNumber } from "@/utils/formatting";
import { format } from "date-fns";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  mobileNo?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  dateOfBirth?: string;
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  stats?: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    wishlistItems: number;
    reviewsGiven: number;
  };
}

export default function CustomerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "customer") {
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
      
      if (data.profile.dateOfBirth) {
        setSelectedDate(new Date(data.profile.dateOfBirth));
      }
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
        dateOfBirth: selectedDate?.toISOString(),
        address: profile.address,
        preferences: profile.preferences,
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

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfile({
        ...profile,
        [parent]: {
          ...(profile[parent as keyof CustomerProfile] as any),
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [field]: value,
      });
    }
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
            Profile Settings
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your account information and preferences
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
                  <AvatarFallback className="bg-blue-600 text-white text-xl sm:text-2xl">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg sm:text-xl">{profile.name}</CardTitle>
              <CardDescription className="text-sm break-all">{profile.email}</CardDescription>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  <User className="h-3 w-3 mr-1" />
                  CUSTOMER
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Button>
              {profile.stats && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(profile.stats.totalOrders)}
                    </div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">
                      {formatNumber(profile.stats.reviewsGiven)}
                    </div>
                    <div className="text-xs text-gray-600">Reviews</div>
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
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={!isEditing}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Address */}
                {profile.address && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Address</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Street Address"
                          value={profile.address.street || ""}
                          onChange={(e) => handleInputChange("address.street", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <Input
                        placeholder="City"
                        value={profile.address.city || ""}
                        onChange={(e) => handleInputChange("address.city", e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="State"
                        value={profile.address.state || ""}
                        onChange={(e) => handleInputChange("address.state", e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="ZIP Code"
                        value={profile.address.zipCode || ""}
                        onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="Country"
                        value={profile.address.country || ""}
                        onChange={(e) => handleInputChange("address.country", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
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

            {/* Account Statistics */}
            {profile.stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Account Statistics</CardTitle>
                  <CardDescription className="text-sm">Your activity summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center bg-blue-50 rounded-lg p-4">
                      <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {formatNumber(profile.stats.totalOrders)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-4">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatNumber(profile.stats.completedOrders)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center bg-yellow-50 rounded-lg p-4">
                      <ShoppingCart className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {formatNumber(profile.stats.pendingOrders)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center bg-red-50 rounded-lg p-4">
                      <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {formatNumber(profile.stats.cancelledOrders)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center bg-purple-50 rounded-lg p-4">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        ₹{formatNumber(profile.stats.totalSpent)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center bg-pink-50 rounded-lg p-4">
                      <Heart className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-pink-600">
                        {formatNumber(profile.stats.wishlistItems)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Wishlist Items</div>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-4">
                      <Star className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-orange-600">
                        {formatNumber(profile.stats.reviewsGiven)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Reviews Given</div>
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
                  Security Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Keep your account secure with a strong password
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
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" className="text-sm">
                    Enable 2FA
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

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmailVerification from "@/components/email-verification";
import MobileVerification from "@/components/mobile-verification";
import {
  Store,
  Edit,
  Shield,
  Camera,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  BarChart,
  Tag,
  Users,
  Eye
} from "lucide-react";
import { formatDate, formatNumber, formatCurrency } from "@/utils/formatting";

interface VendorProfile {
  id: string;
  name: string;
  email: string;
  mobileNo?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  profileImage?: string;
  businessName: string;
  businessType: string;
  businessDescription?: string;
  gstNumber?: string;
  panNumber?: string;
  upiId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  stats?: {
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    storeRating: number;
    totalReviews: number;
    totalCustomers: number;
    monthlyRevenue: number;
  };
}

export default function VendorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as any).role !== "vendor") {
      router.push("/auth/signin");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get("/api/profile");
      
      if (response.data.success && response.data.profile) {
        setProfile(response.data.profile);
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      setError(error.response?.data?.error || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      const updateData = {
        name: profile.name,
        mobileNo: profile.mobileNo,
        businessName: profile.businessName,
        businessType: profile.businessType,
        businessDescription: profile.businessDescription,
        gstNumber: profile.gstNumber,
        panNumber: profile.panNumber,
        upiId: profile.upiId,
        address: profile.address,
        bankDetails: profile.bankDetails,
      };

      const response = await axios.put("/api/profile", updateData);

      if (response.data.success && response.data.profile) {
        setProfile(response.data.profile);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setError(error.response?.data?.error || "Failed to update profile");
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
          ...(profile[parent as keyof VendorProfile] as any),
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
            Vendor Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your store, products, and business details
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                  <AvatarImage src={profile.profileImage || ""} alt={profile.name} />
                  <AvatarFallback className="bg-green-600 text-white text-xl sm:text-2xl">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg sm:text-xl">{profile.businessName}</CardTitle>
              <CardDescription className="text-sm break-all">{profile.email}</CardDescription>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant="outline" className="border-green-600 text-green-600">
                  <Store className="h-3 w-3 mr-1" />
                  VENDOR
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
            <CardContent>
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "dashboard" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "profile" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Store Profile
                </Button>
                <Button
                  variant={activeTab === "verification" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "verification" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("verification")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </Button>
                <Button
                  variant={activeTab === "products" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "products" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Products
                </Button>
                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "orders" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </Button>
                <Button
                  variant={activeTab === "payments" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "payments" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("payments")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === "settings" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Separator className="my-3" />
                <Link href="/(auth)/vendor/products/create" passHref>
                  <Button className="w-full text-sm bg-green-600 hover:bg-green-700">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </Link>
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <>
                {/* Stats Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Business Overview</CardTitle>
                    <CardDescription className="text-sm">Key metrics for your store</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                        <ShoppingBag className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-800">
                          {formatNumber(profile.stats?.totalProducts || 0)}
                        </div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                        <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-800">
                          {formatNumber(profile.stats?.totalOrders || 0)}
                        </div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                        <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-800">
                          ₹{formatNumber(profile.stats?.totalRevenue || 0)}
                        </div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                        <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-800">
                          {(profile.stats?.storeRating || 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-700">Pending Orders</h3>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            {profile.stats?.pendingOrders || 0}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">Needs attention</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-700">Avg. Order Value</h3>
                          <span className="text-sm font-semibold">
                            ₹{formatNumber(profile.stats?.avgOrderValue || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Per transaction</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-700">Total Customers</h3>
                          <span className="text-sm font-semibold">
                            {formatNumber(profile.stats?.totalCustomers || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Unique buyers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                    <CardDescription className="text-sm">Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/(auth)/vendor/products" className="block">
                        <Button className="h-auto flex-col py-4 w-full" variant="outline">
                          <Tag className="h-6 w-6 mb-2" />
                          <span className="text-xs">Manage Products</span>
                        </Button>
                      </Link>
                      <Button className="h-auto flex-col py-4" variant="outline" onClick={() => setActiveTab("orders")}>
                        <Package className="h-6 w-6 mb-2" />
                        <span className="text-xs">View Orders</span>
                      </Button>
                      <Button className="h-auto flex-col py-4" variant="outline" onClick={() => setActiveTab("payments")}>
                        <CreditCard className="h-6 w-6 mb-2" />
                        <span className="text-xs">View Earnings</span>
                      </Button>
                      <Link href="/(auth)/vendor/products/create" className="block">
                        <Button className="h-auto flex-col py-4 w-full" variant="outline">
                          <ShoppingBag className="h-6 w-6 mb-2" />
                          <span className="text-xs">Add Product</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Status Alert */}
                {(!profile.isEmailVerified || !profile.isMobileVerified) && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Please complete your account verification to unlock all seller features.
                      <Button
                        variant="link"
                        className="text-yellow-700 p-0 h-auto text-sm font-medium ml-1"
                        onClick={() => setActiveTab("verification")}
                      >
                        Verify now →
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Store Information</CardTitle>
                      <CardDescription className="text-sm">Your business details visible to customers</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-sm font-medium">
                          Business Name
                        </Label>
                        <Input
                          id="businessName"
                          value={profile.businessName || ""}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-sm font-medium">
                          Business Type
                        </Label>
                        {isEditing ? (
                          <Select
                            value={profile.businessType}
                            onValueChange={(value) => handleInputChange("businessType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Retailer">Retailer</SelectItem>
                              <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                              <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                              <SelectItem value="Service Provider">Service Provider</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="businessType"
                            value={profile.businessType || ""}
                            disabled
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessDescription" className="text-sm font-medium">
                        Business Description
                      </Label>
                      <Textarea
                        id="businessDescription"
                        value={profile.businessDescription || ""}
                        onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                        disabled={!isEditing}
                        className="min-h-[100px]"
                        placeholder="Describe your business and what you sell..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Contact Person
                        </Label>
                        <Input
                          id="name"
                          value={profile.name || ""}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email || ""}
                          className="bg-gray-50"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium">
                          Mobile Number
                        </Label>
                        <Input
                          id="mobile"
                          type="tel"
                          value={profile.mobileNo || ""}
                          onChange={(e) => handleInputChange("mobileNo", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upiId" className="text-sm font-medium">
                          UPI ID (for quick payments)
                        </Label>
                        <Input
                          id="upiId"
                          value={profile.upiId || ""}
                          onChange={(e) => handleInputChange("upiId", e.target.value)}
                          disabled={!isEditing}
                          placeholder="yourname@upi"
                        />
                      </div>
                    </div>

                    {/* Legal Information */}
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Legal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gstNumber" className="text-sm font-medium">
                            GST Number
                          </Label>
                          <Input
                            id="gstNumber"
                            value={profile.gstNumber || ""}
                            onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                            disabled={!isEditing}
                            placeholder="22AAAAA0000A1Z5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="panNumber" className="text-sm font-medium">
                            PAN Number
                          </Label>
                          <Input
                            id="panNumber"
                            value={profile.panNumber || ""}
                            onChange={(e) => handleInputChange("panNumber", e.target.value)}
                            disabled={!isEditing}
                            placeholder="AAAAA0000A"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Business Address</CardTitle>
                    <CardDescription className="text-sm">Your store location and shipping details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
                          <Input
                            id="street"
                            placeholder="Enter your street address"
                            value={profile.address?.street || ""}
                            onChange={(e) => handleInputChange("address.street", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium">City</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={profile.address?.city || ""}
                            onChange={(e) => handleInputChange("address.city", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm font-medium">State</Label>
                          <Input
                            id="state"
                            placeholder="State"
                            value={profile.address?.state || ""}
                            onChange={(e) => handleInputChange("address.state", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="text-sm font-medium">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="ZIP Code"
                            value={profile.address?.zipCode || ""}
                            onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                          <Input
                            id="country"
                            placeholder="Country"
                            value={profile.address?.country || "India"}
                            onChange={(e) => handleInputChange("address.country", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Bank Details</CardTitle>
                    <CardDescription className="text-sm">For receiving payments from sales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="accountHolderName" className="text-sm font-medium">Account Holder Name</Label>
                          <Input
                            id="accountHolderName"
                            value={profile.bankDetails?.accountHolderName || ""}
                            onChange={(e) => handleInputChange("bankDetails.accountHolderName", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Full name as per bank records"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={profile.bankDetails?.bankName || ""}
                            onChange={(e) => handleInputChange("bankDetails.bankName", e.target.value)}
                            disabled={!isEditing}
                            placeholder="State Bank of India"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={profile.bankDetails?.accountNumber || ""}
                            onChange={(e) => handleInputChange("bankDetails.accountNumber", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Account number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ifscCode" className="text-sm font-medium">IFSC Code</Label>
                          <Input
                            id="ifscCode"
                            value={profile.bankDetails?.ifscCode || ""}
                            onChange={(e) => handleInputChange("bankDetails.ifscCode", e.target.value)}
                            disabled={!isEditing}
                            placeholder="SBIN0000123"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Verification Tab */}
            {activeTab === "verification" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="h-5 w-5" />
                    Account Verification
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Verify your business details to build customer trust and unlock all selling features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Verification */}
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Verification
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{profile.email}</p>
                          <p className="text-xs text-gray-500">Your business email address</p>
                        </div>
                        {profile.isEmailVerified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      
                      {!profile.isEmailVerified && (
                        <div className="border-t border-gray-200 pt-3">
                          <EmailVerification 
                            initialEmail={profile.email}
                            showTitle={false}
                            compact={true}
                            onVerificationComplete={() => fetchProfile()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Verification */}
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Mobile Verification
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{profile.mobileNo || "No mobile number"}</p>
                          <p className="text-xs text-gray-500">Your business contact number</p>
                        </div>
                        {profile.isMobileVerified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      
                      {!profile.isMobileVerified && (
                        <div className="border-t border-gray-200 pt-3">
                          <MobileVerification
                            initialPhoneNumber={profile.mobileNo || ""}
                            showTitle={false}
                            compact={true}
                            onVerificationComplete={() => fetchProfile()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Business Verification */}
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Business Documentation
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">GST Certificate</p>
                            <p className="text-xs text-gray-500">GST Number: {profile.gstNumber || "Not provided"}</p>
                          </div>
                          <Button variant="outline" size="sm">Upload</Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">PAN Verification</p>
                            <p className="text-xs text-gray-500">PAN: {profile.panNumber || "Not provided"}</p>
                          </div>
                          <Button variant="outline" size="sm">Upload</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Verification Note */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Complete verification to enhance your store's credibility and access all selling features.
                      Verified vendors receive priority in search results and higher trust from customers.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg sm:text-xl">
                      <Tag className="h-5 w-5" />
                      Your Products
                    </div>
                    <Link href="/(auth)/vendor/products/create">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage your product listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No Products Yet</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Start adding products to your store
                    </p>
                    <Link href="/(auth)/vendor/products/create">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Package className="h-5 w-5" />
                    Orders Management
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Track and manage your customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No Orders Yet</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Orders will appear here when customers make purchases
                    </p>
                    <Button variant="outline" className="mt-2">
                      <Eye className="h-4 w-4 mr-2" />
                      View All Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <CreditCard className="h-5 w-5" />
                    Payments & Earnings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Track your revenue and manage payouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No Transactions Yet</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Your earnings will appear here after your first sale
                    </p>
                    <Button variant="outline" className="mt-2">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Earnings Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Settings className="h-5 w-5" />
                    Store Settings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configure your store preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Order Notifications</p>
                          <p className="text-xs text-gray-500">Get alerts for new orders</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Low Stock Alerts</p>
                          <p className="text-xs text-gray-500">Notified when inventory is low</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Payment Notifications</p>
                          <p className="text-xs text-gray-500">Get alerts for payment updates</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Store Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Store Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Store Status</p>
                          <p className="text-xs text-gray-500">Set your store as active or inactive</p>
                        </div>
                        <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-300">
                          Active
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Auto-Accept Orders</p>
                          <p className="text-xs text-gray-500">Automatically accept incoming orders</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Store Timing</p>
                          <p className="text-xs text-gray-500">Set your business hours</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Set Hours
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Security */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Change Password</p>
                          <p className="text-xs text-gray-500">Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-500">Add extra security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">Setup</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

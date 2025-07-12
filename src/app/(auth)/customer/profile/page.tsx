"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import EmailVerification from "@/components/email-verification";
import MobileVerification from "@/components/mobile-verification";
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
  Settings,
  Bell,
  CreditCard,
} from "lucide-react";
import { formatDate, formatNumber } from "@/utils/formatting";
import { format } from "date-fns";
import { toast } from "sonner";

interface CustomerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  addresses?: any[];
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      orderUpdates: boolean;
      promotions: boolean;
      recommendations: boolean;
    };
    privacy: {
      profileVisibility: string;
      activityTracking: boolean;
      dataSharing: boolean;
    };
  };
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  membershipTier: string;
  role: string;
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
  const [activeTab, setActiveTab] = useState("profile");

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
      const response = await axios.get("/api/customer/profile");
      
      setProfile(response.data.profile);
      
      if (response.data.profile.dateOfBirth) {
        setSelectedDate(new Date(response.data.profile.dateOfBirth));
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load profile data");
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        mobileNo: profile.mobileNo,
        dateOfBirth: selectedDate?.toISOString(),
        gender: profile.gender,
        addresses: profile.addresses,
        preferences: profile.preferences,
      };

      const response = await axios.put("/api/customer/profile", updateData);
      
      setProfile(response.data.profile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
      setSuccess("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage = error.response?.data?.error || "Failed to update profile";
      toast.error(errorMessage);
      setError(errorMessage);
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
            My Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your profile, orders, and preferences
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
            <CardContent>
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "verification" ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveTab("verification")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  className="w-full justify-start text-sm" 
                  onClick={() => setActiveTab("orders")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </Button>
                <Button
                  variant={activeTab === "payment" ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
                <Separator className="my-3" />
                <Link href="/products" passHref>
                  <Button variant="outline" className="w-full text-sm">
                    Continue Shopping
                  </Button>
                </Link>
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                      <CardDescription className="text-sm">Update your personal details</CardDescription>
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
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Shipping Address</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="Street Address"
                            value={profile.address?.street || ""}
                            onChange={(e) => handleInputChange("address.street", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <Input
                          placeholder="City"
                          value={profile.address?.city || ""}
                          onChange={(e) => handleInputChange("address.city", e.target.value)}
                          disabled={!isEditing}
                        />
                        <Input
                          placeholder="State"
                          value={profile.address?.state || ""}
                          onChange={(e) => handleInputChange("address.state", e.target.value)}
                          disabled={!isEditing}
                        />
                        <Input
                          placeholder="ZIP Code"
                          value={profile.address?.zipCode || ""}
                          onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                          disabled={!isEditing}
                        />
                        <Input
                          placeholder="Country"
                          value={profile.address?.country || ""}
                          onChange={(e) => handleInputChange("address.country", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end">
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Card */}
                {profile.stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Account Overview</CardTitle>
                      <CardDescription className="text-sm">Your recent activity and statistics</CardDescription>
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
                        <div className="text-center bg-purple-50 rounded-lg p-4">
                          <Heart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            {formatNumber(profile.stats.wishlistItems)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">Wishlist</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                    Verify your contact details to secure your account and unlock all features
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
                          <p className="text-xs text-gray-500">Your primary email address</p>
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
                          <p className="text-xs text-gray-500">Your contact number for order updates</p>
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
                  
                  {/* Security Note */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Verifying both email and mobile number helps protect your account from unauthorized access
                      and ensures you receive important notifications about your orders and account.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage your preferences and security settings
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
                          <p className="text-sm font-medium">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive order updates and promotions</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => 
                            handleInputChange("preferences.newsletter", 
                            profile.preferences?.newsletter ? false : true)}
                        >
                          {profile.preferences?.newsletter ? "Disable" : "Enable"}
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Get order status via text message</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => 
                            handleInputChange("preferences.notifications", 
                            profile.preferences?.notifications ? false : true)}
                        >
                          {profile.preferences?.notifications ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Security Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Password</p>
                          <p className="text-xs text-gray-500">Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm">Change Password</Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-500">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">Enable 2FA</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Account Actions */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Account Actions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Delete Account</p>
                          <p className="text-xs text-gray-500">Permanently remove your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm">Delete Account</Button>
                      </div>
                    </div>
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
                    Your Orders
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and manage your order history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No Recent Orders</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      You haven't placed any orders yet
                    </p>
                    <Link href="/products" passHref>
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage your payment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No Saved Payment Methods</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Add a payment method for faster checkout
                    </p>
                    <Button>Add Payment Method</Button>
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

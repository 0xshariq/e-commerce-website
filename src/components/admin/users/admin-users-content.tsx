"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  User,
  Users,
  Store,
  UserCheck,
  UserX,
  Mail,
  PhoneCall,
  Eye,
  Lock,
  Unlock
} from "lucide-react"

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'deleted';
  lastLogin?: string;
  isSuspended: boolean;
  totalOrders: number;
  totalSpent: number;
  registrationDate: string;
}

interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  businessInfo: {
    businessName: string;
    businessType: string;
    businessCategory: string;
  };
  email: string;
  mobileNo: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isApproved: boolean;
  isBusinessVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'under_review' | 'rejected';
  lastLogin?: string;
  isSuspended: boolean;
  totalProducts: number;
  activeProducts: number;
  performanceMetrics: {
    totalSales: number;
    totalOrders: number;
    averageRating: number;
  };
  registrationDate: string;
}

export default function AdminUsersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'active' | 'suspended' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    fetchCustomers();
    fetchVendors();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      setError(null);
      
      const response = await fetch("/api/admin/users/customers");
      
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      setError(null);
      
      const response = await fetch("/api/admin/users/vendors");
      
      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setError("Failed to load vendors. Please try again.");
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleCustomerAction = async (customerId: string, action: "suspend" | "unsuspend") => {
    try {
      const response = await fetch(`/api/admin/users/customers/${customerId}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setCustomers(prevCustomers => {
          return prevCustomers.map(customer => {
            if (customer.id === customerId) {
              return {
                ...customer,
                isSuspended: action === 'suspend',
                accountStatus: action === 'suspend' ? 'suspended' : 'active'
              };
            }
            return customer;
          });
        });
      } else {
        throw new Error(`Failed to ${action} customer`);
      }
    } catch (error) {
      console.error(`Failed to ${action} customer:`, error);
    }
  };

  const handleVendorAction = async (vendorId: string, action: "approve" | "suspend" | "unsuspend" | "reject") => {
    try {
      const response = await fetch(`/api/admin/users/vendors/${vendorId}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setVendors(prevVendors => {
          return prevVendors.map(vendor => {
            if (vendor.id === vendorId) {
              const updatedVendor = { ...vendor };
              
              if (action === 'suspend') {
                updatedVendor.isSuspended = true;
                updatedVendor.accountStatus = 'suspended';
              } else if (action === 'unsuspend') {
                updatedVendor.isSuspended = false;
                updatedVendor.accountStatus = 'active';
              } else if (action === 'approve') {
                updatedVendor.isApproved = true;
                updatedVendor.accountStatus = 'active';
              } else if (action === 'reject') {
                updatedVendor.isApproved = false;
                updatedVendor.accountStatus = 'rejected';
              }
              
              return updatedVendor;
            }
            return vendor;
          });
        });
      } else {
        throw new Error(`Failed to ${action} vendor`);
      }
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                          customer.lastName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          customer.mobileNo.includes(customerSearchQuery);
    
    const matchesFilter = customerFilter === 'all' || 
                          (customerFilter === 'active' && !customer.isSuspended) ||
                          (customerFilter === 'suspended' && customer.isSuspended);
    
    return matchesSearch && matchesFilter;
  });

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.firstName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) || 
                          vendor.lastName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                          vendor.businessInfo.businessName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                          vendor.email.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                          vendor.mobileNo.includes(vendorSearchQuery);
    
    const matchesFilter = vendorFilter === 'all' || 
                          (vendorFilter === 'active' && vendor.isApproved && !vendor.isSuspended) ||
                          (vendorFilter === 'suspended' && vendor.isSuspended) ||
                          (vendorFilter === 'pending' && !vendor.isApproved && vendor.accountStatus !== 'rejected') ||
                          (vendorFilter === 'rejected' && vendor.accountStatus === 'rejected');
    
    return matchesSearch && matchesFilter;
  });

  const renderLoading = () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading users...</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-white mb-4">{error}</p>
        <Button onClick={() => { fetchCustomers(); fetchVendors(); }} className="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>
    </div>
  );

  if (error) {
    return renderError();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage all customer and vendor accounts</p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="customers" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-green-600">
            <Store className="h-4 w-4 mr-2" />
            Vendors
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search customers by name, email, or phone" 
                className="pl-10 bg-gray-800/80 border-gray-700 text-white"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex gap-2">
                <Badge 
                  className={`cursor-pointer ${customerFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setCustomerFilter('all')}
                >
                  All
                </Badge>
                <Badge 
                  className={`cursor-pointer ${customerFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setCustomerFilter('active')}
                >
                  Active
                </Badge>
                <Badge 
                  className={`cursor-pointer ${customerFilter === 'suspended' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setCustomerFilter('suspended')}
                >
                  Suspended
                </Badge>
              </div>
            </div>
          </div>

          {/* Customers List */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Customers</CardTitle>
                  <CardDescription>
                    {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={fetchCustomers} 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCustomers ? (
                renderLoading()
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No customers match your search or filter criteria</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredCustomers.map((customer) => (
                    <div 
                      key={customer.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors"
                    >
                      <div className="sm:w-16 sm:h-16 w-full h-24 bg-gray-600 rounded-full overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                        {customer.profileImage ? (
                          <img 
                            src={customer.profileImage} 
                            alt={`${customer.firstName} ${customer.lastName}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{customer.firstName} {customer.lastName}</h3>
                          {customer.isSuspended ? (
                            <Badge className="bg-red-600 sm:ml-2 mx-auto sm:mx-0">Suspended</Badge>
                          ) : (
                            <Badge className="bg-green-600 sm:ml-2 mx-auto sm:mx-0">Active</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-y-1 gap-x-4 text-sm text-gray-400 mb-2">
                          <span className="flex items-center justify-center sm:justify-start gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                            {customer.isEmailVerified && (
                              <Badge variant="outline" className="ml-1 text-xs border-green-500 text-green-500">Verified</Badge>
                            )}
                          </span>
                          <span className="flex items-center justify-center sm:justify-start gap-1">
                            <PhoneCall className="h-3 w-3" />
                            {customer.mobileNo}
                            {customer.isMobileVerified && (
                              <Badge variant="outline" className="ml-1 text-xs border-green-500 text-green-500">Verified</Badge>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span>Registered: {new Date(customer.registrationDate).toLocaleDateString()}</span>
                          <span>Orders: {customer.totalOrders}</span>
                          <span>Spent: ₹{customer.totalSpent.toLocaleString()}</span>
                          {customer.lastLogin && (
                            <span>Last Login: {new Date(customer.lastLogin).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-center sm:flex-col gap-2 mt-3 sm:mt-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          onClick={() => window.location.href = `/admin/users/customers/${customer.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {customer.isSuspended ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCustomerAction(customer.id, "unsuspend")}
                          >
                            <Unlock className="h-4 w-4 mr-1" />
                            Unsuspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleCustomerAction(customer.id, "suspend")}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search vendors by name, business name, email, or phone" 
                className="pl-10 bg-gray-800/80 border-gray-700 text-white"
                value={vendorSearchQuery}
                onChange={(e) => setVendorSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                <Badge 
                  className={`cursor-pointer ${vendorFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setVendorFilter('all')}
                >
                  All
                </Badge>
                <Badge 
                  className={`cursor-pointer ${vendorFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setVendorFilter('active')}
                >
                  Active
                </Badge>
                <Badge 
                  className={`cursor-pointer ${vendorFilter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setVendorFilter('pending')}
                >
                  Pending
                </Badge>
                <Badge 
                  className={`cursor-pointer ${vendorFilter === 'suspended' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setVendorFilter('suspended')}
                >
                  Suspended
                </Badge>
                <Badge 
                  className={`cursor-pointer ${vendorFilter === 'rejected' ? 'bg-gray-500 hover:bg-gray-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setVendorFilter('rejected')}
                >
                  Rejected
                </Badge>
              </div>
            </div>
          </div>

          {/* Vendors List */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Vendors</CardTitle>
                  <CardDescription>
                    {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} found
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={fetchVendors} 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingVendors ? (
                renderLoading()
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No vendors match your search or filter criteria</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredVendors.map((vendor) => (
                    <div 
                      key={vendor.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors"
                    >
                      <div className="sm:w-16 sm:h-16 w-full h-24 bg-gray-600 rounded-full overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                        {vendor.profileImage ? (
                          <img 
                            src={vendor.profileImage} 
                            alt={vendor.businessInfo.businessName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{vendor.businessInfo.businessName}</h3>
                          {vendor.isSuspended ? (
                            <Badge className="bg-red-600 sm:ml-2 mx-auto sm:mx-0">Suspended</Badge>
                          ) : vendor.isApproved ? (
                            <Badge className="bg-green-600 sm:ml-2 mx-auto sm:mx-0">Active</Badge>
                          ) : vendor.accountStatus === 'rejected' ? (
                            <Badge className="bg-gray-600 sm:ml-2 mx-auto sm:mx-0">Rejected</Badge>
                          ) : (
                            <Badge className="bg-yellow-600 sm:ml-2 mx-auto sm:mx-0">Pending</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-1">
                          {vendor.firstName} {vendor.lastName}
                          <span className="mx-2">•</span>
                          {vendor.businessInfo.businessType}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-y-1 gap-x-4 text-sm text-gray-400 mb-2">
                          <span className="flex items-center justify-center sm:justify-start gap-1">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                            {vendor.isEmailVerified && (
                              <Badge variant="outline" className="ml-1 text-xs border-green-500 text-green-500">Verified</Badge>
                            )}
                          </span>
                          <span className="flex items-center justify-center sm:justify-start gap-1">
                            <PhoneCall className="h-3 w-3" />
                            {vendor.mobileNo}
                            {vendor.isMobileVerified && (
                              <Badge variant="outline" className="ml-1 text-xs border-green-500 text-green-500">Verified</Badge>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span>Registered: {new Date(vendor.registrationDate).toLocaleDateString()}</span>
                          <span>Products: {vendor.totalProducts} ({vendor.activeProducts} active)</span>
                          <span>Orders: {vendor.performanceMetrics.totalOrders}</span>
                          <span>Sales: ₹{vendor.performanceMetrics.totalSales.toLocaleString()}</span>
                          <span>Rating: {vendor.performanceMetrics.averageRating.toFixed(1)}/5.0</span>
                          {vendor.lastLogin && (
                            <span>Last Login: {new Date(vendor.lastLogin).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-center sm:flex-col gap-2 mt-3 sm:mt-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          onClick={() => window.location.href = `/admin/users/vendors/${vendor.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {!vendor.isApproved && vendor.accountStatus !== 'rejected' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleVendorAction(vendor.id, "approve")}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                              onClick={() => handleVendorAction(vendor.id, "reject")}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {vendor.isApproved && (
                          vendor.isSuspended ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleVendorAction(vendor.id, "unsuspend")}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Unsuspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              onClick={() => handleVendorAction(vendor.id, "suspend")}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

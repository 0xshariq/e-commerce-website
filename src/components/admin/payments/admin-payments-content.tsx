"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import AdminRefundRequests from "../dashboard/refund-requests"
import { 
  Search, 
  Filter, 
  AlertTriangle,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Eye
} from "lucide-react"

interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  transactionId: string;
  razorpayPaymentId?: string;
}

export default function AdminPaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'successful' | 'pending' | 'failed' | 'refunded'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/payments");
      
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setError("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.razorpayPaymentId && payment.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filter === 'all' || payment.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate total amount, successful payments, and refunded amount
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const successfulAmount = filteredPayments
    .filter(payment => payment.status === 'successful')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const refundedAmount = filteredPayments
    .filter(payment => payment.status === 'refunded')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading payment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <Button onClick={fetchPayments} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Payment Management</h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage payments and refund requests</p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="refunds" className="data-[state=active]:bg-red-600">
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Refunds
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Transactions</CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  ₹{totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400">{filteredPayments.length} transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Successful Payments</CardTitle>
                <ArrowUpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  ₹{successfulAmount.toLocaleString()}
                </div>
                <p className="text-xs text-green-400">
                  {filteredPayments.filter(p => p.status === 'successful').length} successful transactions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Refunded Amount</CardTitle>
                <ArrowDownCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  ₹{refundedAmount.toLocaleString()}
                </div>
                <p className="text-xs text-red-400">
                  {filteredPayments.filter(p => p.status === 'refunded').length} refunded transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by customer, order ID, or transaction ID" 
                className="pl-10 bg-gray-800/80 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  className={`cursor-pointer ${filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </Badge>
                <Badge 
                  className={`cursor-pointer ${filter === 'successful' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setFilter('successful')}
                >
                  Successful
                </Badge>
                <Badge 
                  className={`cursor-pointer ${filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </Badge>
                <Badge 
                  className={`cursor-pointer ${filter === 'failed' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setFilter('failed')}
                >
                  Failed
                </Badge>
                <Badge 
                  className={`cursor-pointer ${filter === 'refunded' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setFilter('refunded')}
                >
                  Refunded
                </Badge>
              </div>
            </div>
          </div>

          {/* Payments List */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Payments</CardTitle>
                  <CardDescription>
                    {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'} found
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={fetchPayments} 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No payments match your search or filter criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Headers */}
                  <div className="hidden md:grid md:grid-cols-12 text-xs font-medium text-gray-400 p-2">
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Order ID</div>
                    <div className="col-span-2">Customer</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Payment Method</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>

                  {/* Payment Rows */}
                  {filteredPayments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors"
                    >
                      <div className="md:col-span-2 flex items-center md:block">
                        <span className="text-xs text-gray-400 md:hidden mr-2 w-24">Date:</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-white text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center md:block">
                        <span className="text-xs text-gray-400 md:hidden mr-2 w-24">Order ID:</span>
                        <span className="text-white text-sm font-mono">
                          #{payment.orderId.substring(0, 8)}...
                        </span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center md:block">
                        <span className="text-xs text-gray-400 md:hidden mr-2 w-24">Customer:</span>
                        <span className="text-white text-sm">
                          {payment.customerName}
                        </span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center md:block">
                        <span className="text-xs text-gray-400 md:hidden mr-2 w-24">Amount:</span>
                        <span className="text-white text-sm font-medium">
                          ₹{payment.amount.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center md:block">
                        <span className="text-xs text-gray-400 md:hidden mr-2 w-24">Payment Method:</span>
                        <span className="text-white text-sm capitalize">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      
                      <div className="md:col-span-1 flex items-center md:block">
                        <span className="text-xs text-gray-400 md:hidden mr-2 w-24">Status:</span>
                        {payment.status === 'successful' && (
                          <Badge className="bg-green-600">Successful</Badge>
                        )}
                        {payment.status === 'pending' && (
                          <Badge className="bg-yellow-600">Pending</Badge>
                        )}
                        {payment.status === 'failed' && (
                          <Badge className="bg-red-600">Failed</Badge>
                        )}
                        {payment.status === 'refunded' && (
                          <Badge className="bg-orange-600">Refunded</Badge>
                        )}
                      </div>
                      
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          onClick={() => window.location.href = `/admin/payments/${payment.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds" className="space-y-6">
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Refund Requests</CardTitle>
              <CardDescription>Manage customer refund requests</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminRefundRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Eye, 
  RefreshCw, 
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

interface RefundRequest {
  _id: string
  orderId: {
    _id: string
    orderNumber: string
    totalAmount: number
    createdAt: string
    orderStatus: string
  }
  customerId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  amount: number
  reason: string
  notes?: string
  refundReasonCategory: string
  requestStatus: "pending" | "accepted" | "rejected"
  attachments: string[]
  createdAt: string
  processedAt?: string
  adminNotes?: string
  rejectionReason?: string
}

export default function VendorRefundRequests() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchRefundRequests()
  }, [currentPage, statusFilter])

  const fetchRefundRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/refund/request?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRefundRequests(data.refundRequests)
        setTotalPages(data.pagination.pages)
      } else {
        toast.error("Failed to fetch refund requests")
      }
    } catch (error) {
      toast.error("Error loading refund requests")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "default" as const, icon: Clock, color: "text-yellow-600" },
      accepted: { variant: "secondary" as const, icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    }

    const config = variants[status as keyof typeof variants] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredRequests = refundRequests.filter(request => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      request.orderId.orderNumber.toLowerCase().includes(searchLower) ||
      `${request.customerId.firstName} ${request.customerId.lastName}`.toLowerCase().includes(searchLower) ||
      request.customerId.email.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading refund requests...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Refund Requests</CardTitle>
            <CardDescription>View refund requests for your products</CardDescription>
          </div>
          <Button onClick={fetchRefundRequests} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by order or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No refund requests found</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== "all" 
                  ? `No ${statusFilter} refund requests at the moment.`
                  : "You haven't received any refund requests yet."
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request._id} className="border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-semibold text-lg">Order #{request.orderId.orderNumber}</h3>
                        {getStatusBadge(request.requestStatus)}
                        <span className="text-lg font-semibold text-green-600">
                          ₹{request.amount}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{request.customerId.firstName} {request.customerId.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>Order Total: ₹{request.orderId.totalAmount}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 font-medium">Reason:</p>
                        <p className="text-sm text-gray-800">{request.reason}</p>
                      </div>

                      {request.requestStatus === "accepted" && (
                        <div className="mb-3">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-800 text-sm font-medium">✓ Approved by Admin</p>
                            <p className="text-green-700 text-sm">Customer can now proceed with the refund.</p>
                          </div>
                        </div>
                      )}

                      {request.requestStatus === "rejected" && request.rejectionReason && (
                        <div className="mb-3">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm font-medium">✗ Rejected by Admin</p>
                            <p className="text-red-700 text-sm">{request.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {request.adminNotes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Admin Notes:</p>
                          <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                            {request.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Refund Request Details</DialogTitle>
                            <DialogDescription>
                              Order #{request.orderId.orderNumber}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Customer</Label>
                                <p className="text-sm">{request.customerId.firstName} {request.customerId.lastName}</p>
                                <p className="text-sm text-gray-600">{request.customerId.email}</p>
                                <p className="text-sm text-gray-600">{request.customerId.phone}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Order Information</Label>
                                <p className="text-sm">Total: ₹{request.orderId.totalAmount}</p>
                                <p className="text-sm text-gray-600">Status: {request.orderId.orderStatus}</p>
                                <p className="text-sm text-gray-600">
                                  Date: {new Date(request.orderId.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-medium">Refund Amount</Label>
                              <p className="text-2xl font-bold text-green-600">₹{request.amount}</p>
                            </div>
                            
                            <div>
                              <Label className="font-medium">Category</Label>
                              <p className="text-sm capitalize">{request.refundReasonCategory.replace("_", " ")}</p>
                            </div>
                            
                            <div>
                              <Label className="font-medium">Reason</Label>
                              <p className="text-sm">{request.reason}</p>
                            </div>
                            
                            {request.notes && (
                              <div>
                                <Label className="font-medium">Additional Notes</Label>
                                <p className="text-sm">{request.notes}</p>
                              </div>
                            )}
                            
                            <div>
                              <Label className="font-medium">Status</Label>
                              <div className="mt-1">{getStatusBadge(request.requestStatus)}</div>
                            </div>
                            
                            <div>
                              <Label className="font-medium">Request Date</Label>
                              <p className="text-sm">{new Date(request.createdAt).toLocaleString()}</p>
                            </div>
                            
                            {request.processedAt && (
                              <div>
                                <Label className="font-medium">Processed Date</Label>
                                <p className="text-sm">{new Date(request.processedAt).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

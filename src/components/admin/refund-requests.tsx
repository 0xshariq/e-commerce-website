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
  Check, 
  X, 
  RefreshCw, 
  Search,
  Filter,
  Calendar,
  User,
  Store,
  CreditCard
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
  vendorId: {
    _id: string
    businessName: string
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

export default function AdminRefundRequests() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)
  const [modalAction, setModalAction] = useState<"accept" | "reject" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

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

  const handleAction = async (action: "accept" | "reject") => {
    if (!selectedRequest) return

    try {
      setProcessing(selectedRequest._id)
      
      const response = await fetch("/api/refund/request", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: selectedRequest._id,
          action,
          adminNotes,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
        }),
      })

      if (response.ok) {
        toast.success(`Refund request ${action}ed successfully`)
        fetchRefundRequests()
        setSelectedRequest(null)
        setModalAction(null)
        setAdminNotes("")
        setRejectionReason("")
      } else {
        const data = await response.json()
        toast.error(data.error || `Failed to ${action} refund request`)
      }
    } catch (error) {
      toast.error(`Error ${action}ing refund request`)
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default",
      accepted: "secondary",
      rejected: "destructive",
    } as const

    const labels = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const filteredRequests = refundRequests.filter(request => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      request.orderId.orderNumber.toLowerCase().includes(searchLower) ||
      `${request.customerId.firstName} ${request.customerId.lastName}`.toLowerCase().includes(searchLower) ||
      request.vendorId.businessName.toLowerCase().includes(searchLower) ||
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refund Requests Management</CardTitle>
              <CardDescription>Review and process customer refund requests</CardDescription>
            </div>
            <Button onClick={fetchRefundRequests} variant="outline">
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
                  placeholder="Search by order, customer, or vendor..."
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
            {filteredRequests.map((request) => (
              <Card key={request._id} className="border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-semibold">Order #{request.orderId.orderNumber}</h3>
                        {getStatusBadge(request.requestStatus)}
                        <span className="text-sm text-gray-500">
                          ₹{request.amount}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{request.customerId.firstName} {request.customerId.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-400" />
                          <span>{request.vendorId.businessName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 font-medium">Reason:</p>
                        <p className="text-sm text-gray-800">{request.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
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
                              </div>
                              <div>
                                <Label className="font-medium">Vendor</Label>
                                <p className="text-sm">{request.vendorId.businessName}</p>
                                <p className="text-sm text-gray-600">{request.vendorId.email}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Refund Amount</Label>
                              <p className="text-lg font-semibold">₹{request.amount}</p>
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
                            {request.adminNotes && (
                              <div>
                                <Label className="font-medium">Admin Notes</Label>
                                <p className="text-sm">{request.adminNotes}</p>
                              </div>
                            )}
                            {request.rejectionReason && (
                              <div>
                                <Label className="font-medium">Rejection Reason</Label>
                                <p className="text-sm text-red-600">{request.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {request.requestStatus === "pending" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setModalAction("accept")
                                }}
                                disabled={processing === request._id}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Accept Refund Request</DialogTitle>
                                <DialogDescription>
                                  Approve this refund request for ₹{request.amount}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                                  <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add any notes about this approval..."
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setModalAction(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleAction("accept")}
                                    disabled={processing === request._id}
                                  >
                                    {processing === request._id ? "Processing..." : "Accept Request"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setModalAction("reject")
                                }}
                                disabled={processing === request._id}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Refund Request</DialogTitle>
                                <DialogDescription>
                                  Reject this refund request for ₹{request.amount}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                                  <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this request is being rejected..."
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="adminNotesReject">Admin Notes (Optional)</Label>
                                  <Textarea
                                    id="adminNotesReject"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add any additional notes..."
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setModalAction(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleAction("reject")}
                                    disabled={processing === request._id || !rejectionReason.trim()}
                                  >
                                    {processing === request._id ? "Processing..." : "Reject Request"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredRequests.length === 0 && !loading && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No refund requests found</p>
              </div>
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
    </div>
  )
}

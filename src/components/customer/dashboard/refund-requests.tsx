"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Eye, 
  RefreshCw, 
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
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
  vendorId: {
    _id: string
    businessName: string
    email: string
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

export default function CustomerRefundRequests() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchRefundRequests()
  }, [])

  const fetchRefundRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/refund/request")
      if (response.ok) {
        const data = await response.json()
        setRefundRequests(data.refundRequests)
      } else {
        toast.error("Failed to fetch refund requests")
      }
    } catch (error) {
      toast.error("Error loading refund requests")
    } finally {
      setLoading(false)
    }
  }

  const proceedWithRefund = async (requestId: string, paymentId: string) => {
    try {
      setProcessing(requestId)
      
      const response = await fetch("/api/refund/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestRefundId: requestId,
          razorpayPaymentId: paymentId,
        }),
      })

      if (response.ok) {
        toast.success("Refund initiated successfully")
        fetchRefundRequests()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to initiate refund")
      }
    } catch (error) {
      toast.error("Error initiating refund")
    } finally {
      setProcessing(null)
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your refund request is being reviewed by our admin team."
      case "accepted":
        return "Your refund request has been approved. You can now proceed with the refund."
      case "rejected":
        return "Your refund request has been rejected. See the reason below."
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Refund Requests</CardTitle>
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
            <CardTitle>My Refund Requests</CardTitle>
            <CardDescription>Track the status of your refund requests</CardDescription>
          </div>
          <Button onClick={fetchRefundRequests} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {refundRequests.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No refund requests found</p>
            <p className="text-sm text-gray-500">
              You haven't submitted any refund requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {refundRequests.map((request) => (
              <Card key={request._id} className="border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Order #{request.orderId.orderNumber}
                        </h3>
                        {getStatusBadge(request.requestStatus)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">₹{request.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Vendor: {request.vendorId.businessName}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Status:</p>
                        <p className="text-sm">{getStatusDescription(request.requestStatus)}</p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm">{request.reason}</p>
                      </div>

                      {request.adminNotes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Admin Notes:</p>
                          <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                            {request.adminNotes}
                          </p>
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                            {request.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
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
                                <p className="font-medium">Refund Amount</p>
                                <p className="text-2xl font-bold text-green-600">₹{request.amount}</p>
                              </div>
                              <div>
                                <p className="font-medium">Status</p>
                                <div className="mt-1">{getStatusBadge(request.requestStatus)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-medium">Category</p>
                              <p className="text-sm capitalize">{request.refundReasonCategory.replace("_", " ")}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium">Reason</p>
                              <p className="text-sm">{request.reason}</p>
                            </div>
                            
                            {request.notes && (
                              <div>
                                <p className="font-medium">Additional Notes</p>
                                <p className="text-sm">{request.notes}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="font-medium">Vendor</p>
                              <p className="text-sm">{request.vendorId.businessName}</p>
                              <p className="text-xs text-gray-600">{request.vendorId.email}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium">Request Date</p>
                              <p className="text-sm">{new Date(request.createdAt).toLocaleString()}</p>
                            </div>
                            
                            {request.processedAt && (
                              <div>
                                <p className="font-medium">Processed Date</p>
                                <p className="text-sm">{new Date(request.processedAt).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {request.requestStatus === "accepted" && (
                        <Button 
                          size="sm"
                          onClick={() => proceedWithRefund(request._id, "dummy_payment_id")}
                          disabled={processing === request._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processing === request._id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Proceed with Refund
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

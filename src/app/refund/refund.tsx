"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

export default function RefundPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Remove useToast hook

  const requestId = searchParams.get("requestId")
  const [refundRequest, setRefundRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [razorpayPaymentId, setRazorpayPaymentId] = useState("")

  useEffect(() => {
    if (!requestId) {
      toast.error("Refund request ID is required")
      router.push("/customer/dashboard")
      return
    }

    fetchRefundRequest()
  }, [requestId])

  const fetchRefundRequest = async () => {
    try {
      const response = await fetch(`/api/refund/request/${requestId}`)
      if (response.ok) {
        const data = await response.json()
        setRefundRequest(data.refundRequest)
      } else {
        throw new Error("Failed to fetch refund request")
      }
    } catch (error) {
      toast.error("Failed to load refund request details")
      router.push("/customer/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleRefundInitiation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!razorpayPaymentId.trim()) {
      toast.error("Please enter your Razorpay Payment ID")
      return
    }

    setProcessing(true)

    try {
      const response = await fetch("/api/refund/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          razorpayPaymentId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Refund Initiated",
          description: "Your refund has been initiated successfully. It will be processed within 5-7 business days.",
        })
        router.push("/customer/dashboard")
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to initiate refund")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate refund",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading refund details...</p>
        </div>
      </div>
    )
  }

  if (!refundRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Refund request not found</p>
        </div>
      </div>
    )
  }

  if (refundRequest.requestStatus !== "accepted") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">
            This refund request is {refundRequest.requestStatus}. Only accepted requests can be processed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Process Refund</h1>
          <p className="text-gray-600">Complete your refund process</p>
        </div>

        <div className="space-y-6">
          {/* Refund Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Refund Request Approved
              </CardTitle>
              <CardDescription>Your refund request has been approved by the vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Order Number</p>
                  <p className="text-gray-600">{refundRequest.orderId?.orderNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Refund Amount</p>
                  <p className="text-gray-600">₹{refundRequest.amount}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Reason</p>
                  <p className="text-gray-600">{refundRequest.reason}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-green-600 capitalize font-medium">{refundRequest.requestStatus}</p>
                </div>
              </div>
              {refundRequest.notes && (
                <div className="mt-4">
                  <p className="font-medium text-gray-900">Vendor Notes</p>
                  <p className="text-gray-600 text-sm">{refundRequest.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment ID Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Enter Payment Details
              </CardTitle>
              <CardDescription>Please provide your Razorpay Payment ID to process the refund</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRefundInitiation} className="space-y-6">
                <div>
                  <Label htmlFor="paymentId">Razorpay Payment ID</Label>
                  <Input
                    id="paymentId"
                    type="text"
                    placeholder="pay_xxxxxxxxxxxxxxxxxx"
                    value={razorpayPaymentId}
                    onChange={(e) => setRazorpayPaymentId(e.target.value)}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can find this in your payment confirmation email or transaction history
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Refunds typically take 5-7 business days to process</li>
                    <li>• The amount will be credited to your original payment method</li>
                    <li>• You will receive a confirmation email once the refund is processed</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? "Processing..." : "Initiate Refund"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

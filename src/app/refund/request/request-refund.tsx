"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Upload, AlertCircle } from "lucide-react"

export default function RequestRefundPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const orderId = searchParams.get("orderId")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    amount: 0,
    reason: "",
    notes: "",
    refundReasonCategory: "other" as "duplicate" | "not_as_described" | "other",
    attachments: [] as string[],
  })

  useEffect(() => {
    if (!orderId) {
      toast.error("Order ID is required")
      router.push("/customer/dashboard")
      return
    }

    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/order/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data.order)
        setFormData((prev) => ({ ...prev, amount: data.order.totalAmount }))
      } else {
        throw new Error("Failed to fetch order details")
      }
    } catch (error) {
      toast.error("Failed to load order details")
      router.push("/customer/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/refund/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          vendorId: orderDetails.vendorId,
          ...formData,
        }),
      })

      if (response.ok) {
        toast.success("Your refund request has been submitted successfully. You will be notified once it's reviewed.")
        router.push("/customer/dashboard")
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit refund request")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit refund request")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Request Refund</h1>
          <p className="text-gray-600">Submit a refund request for your order</p>
        </div>

        <div className="space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Order Number</p>
                  <p className="text-gray-600">{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Date</p>
                  <p className="text-gray-600">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Amount</p>
                  <p className="text-gray-600">₹{orderDetails.totalAmount}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-gray-600 capitalize">{orderDetails.orderStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Form */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Request Form</CardTitle>
              <CardDescription>Please provide details about why you want to request a refund</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Refund Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                      max={orderDetails.totalAmount}
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Reason Category</Label>
                    <Select
                      value={formData.refundReasonCategory}
                      onValueChange={(value: "duplicate" | "not_as_described" | "other") =>
                        setFormData((prev) => ({ ...prev, refundReasonCategory: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="duplicate">Duplicate Order</SelectItem>
                        <SelectItem value="not_as_described">Not as Described</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Refund</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please explain why you want a refund..."
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Attachments (Optional)</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload images or documents to support your refund request</p>
                    <Button type="button" variant="outline" className="mt-2 bg-transparent">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Submitting..." : "Submit Refund Request"}
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

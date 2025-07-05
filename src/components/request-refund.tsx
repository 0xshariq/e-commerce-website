"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Upload, FileText } from "lucide-react"
import { toast } from "sonner"

interface RefundRequestProps {
  orderId: string
  amount: number
  vendorId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function RequestRefund({ orderId, amount, vendorId, onSuccess, onCancel }: RefundRequestProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    notes: "",
    refundReasonCategory: "other" as "duplicate" | "not_as_described" | "defective" | "wrong_item" | "other",
    attachments: [] as string[]
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      toast.error("Please login to request a refund")
      return
    }

    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for the refund")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/refund/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId,
          customerId: session.user.id,
          vendorId,
          amount,
          reason: formData.reason,
          notes: formData.notes,
          refundReasonCategory: formData.refundReasonCategory,
          attachments: formData.attachments
        })
      })

      if (response.ok) {
        toast.success("Refund request submitted successfully!")
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to submit refund request")
      }
    } catch (error) {
      toast.error("Error submitting refund request")
    } finally {
      setLoading(false)
    }
  }

  const reasonCategories = [
    { value: "duplicate", label: "Duplicate Order" },
    { value: "not_as_described", label: "Item Not as Described" },
    { value: "defective", label: "Defective Product" },
    { value: "wrong_item", label: "Wrong Item Received" },
    { value: "other", label: "Other" }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Request Refund
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Refund Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Refund Amount:</span>
              <span className="text-lg font-semibold text-green-600">₹{amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Reason Category */}
          <div className="space-y-2">
            <Label htmlFor="refundReasonCategory">Refund Category *</Label>
            <Select 
              value={formData.refundReasonCategory} 
              onValueChange={(value: any) => handleInputChange("refundReasonCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select refund category" />
              </SelectTrigger>
              <SelectContent>
                {reasonCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund *</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you want to request a refund..."
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Upload images or documents to support your refund request
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  // File upload logic would go here
                  toast.info("File upload feature coming soon")
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refund requests will be reviewed within 3-5 business days</li>
                  <li>Refunds will be processed to your original payment method</li>
                  <li>Some items may not be eligible for refunds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Submitting..." : "Submit Refund Request"}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

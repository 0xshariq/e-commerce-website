"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface PendingVendorsProps {
  pendingVendors: Array<{
    id: string;
    businessName: string;
    email: string;
    registrationDate: string;
    businessType: string;
  }> | undefined;
  onApprove: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
}

export default function PendingVendorsCard({ 
  pendingVendors = [], 
  onApprove, 
  onReject 
}: PendingVendorsProps) {
  return (
    <Card id="pending-vendors" className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Pending Vendor Approvals</CardTitle>
        <CardDescription className="text-gray-400 text-sm">New vendor registrations awaiting approval</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {pendingVendors.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No pending vendor approvals</p>
          </div>
        ) : (
          pendingVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base truncate">{vendor.businessName}</p>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{vendor.email}</p>
                <p className="text-xs text-gray-500">
                  {vendor.businessType} • Registered {new Date(vendor.registrationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-xs h-8 px-3"
                  onClick={() => onApprove(vendor.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs h-8 px-3"
                  onClick={() => onReject(vendor.id)}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

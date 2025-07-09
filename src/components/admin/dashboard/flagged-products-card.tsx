"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, XCircle } from "lucide-react"

interface FlaggedProductsProps {
  flaggedProducts: Array<{
    id: string;
    name: string;
    vendor: string;
    reason: string;
    reportedBy: string;
    flaggedDate: string;
  }> | undefined;
  onApprove: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export default function FlaggedProductsCard({ 
  flaggedProducts = [], 
  onApprove, 
  onRemove 
}: FlaggedProductsProps) {
  return (
    <Card id="flagged-products" className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Flagged Products</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Products requiring review</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {flaggedProducts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No flagged products</p>
          </div>
        ) : (
          flaggedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base truncate">{product.name}</p>
                <p className="text-xs sm:text-sm text-gray-400 truncate">Vendor: {product.vendor}</p>
                <p className="text-xs text-red-400">
                  Reason: {product.reason} • Reported by {product.reportedBy}
                </p>
                <p className="text-xs text-gray-500">
                  Flagged {new Date(product.flaggedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-xs h-8 px-3"
                  onClick={() => window.location.href = `/admin/products/${product.id}`}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Review
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-xs h-8 px-3"
                  onClick={() => onApprove(product.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs h-8 px-3"
                  onClick={() => onRemove(product.id)}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

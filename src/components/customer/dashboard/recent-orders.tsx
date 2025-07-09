"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Search } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/formatting"

interface RecentOrdersProps {
  recentOrders: Array<{
    id: string
    orderNumber: string
    productName: string
    quantity: number
    amount: number
    status: string
    createdAt: string
    vendor: string
  }>
}

export default function RecentOrders({ recentOrders }: RecentOrdersProps) {
  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Recent Orders</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Your recent purchase history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No orders placed yet</p>
              <p className="text-xs text-gray-500">Items you purchase will appear here</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base truncate">
                      {order.orderNumber}: {order.productName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {formatDate(order.createdAt)} • {order.vendor}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      order.status === "delivered"
                        ? "border-green-600 text-green-400"
                        : order.status === "processing"
                          ? "border-blue-600 text-blue-400"
                          : order.status === "shipped"
                            ? "border-purple-600 text-purple-400"
                            : "border-yellow-600 text-yellow-400"
                    }`}
                  >
                    {order.status}
                  </Badge>
                  <div className="text-sm font-medium text-white">₹{order.amount}</div>
                </div>
              </div>
            ))
          )}

          {recentOrders.length > 0 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                className="text-xs border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => (window.location.href = "/orders")}
              >
                <Eye className="h-3 w-3 mr-1" />
                View All Orders
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

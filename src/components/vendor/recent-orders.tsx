"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  _id: string
  totalAmount: number
  orderStatus: string
  createdAt: string
  productId: {
    _id: string
    productName: string
  }
  customerId: {
    _id: string
    name: string
  }
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/vendor/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders((data.orders || []).slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/2 mt-1"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Recent Orders
        </CardTitle>
        <Link href="/vendor/orders">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium text-sm">{order.productId?.productName}</p>
                  <p className="text-gray-400 text-xs">{order.customerId?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">₹{order.totalAmount}</p>
                  <Badge 
                    variant={
                      order.orderStatus === "delivered" ? "default" :
                      order.orderStatus === "pending" ? "secondary" : "destructive"
                    } 
                    className="text-xs"
                  >
                    {order.orderStatus}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No orders yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

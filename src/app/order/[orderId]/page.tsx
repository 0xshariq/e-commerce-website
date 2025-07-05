"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, ArrowLeft, MapPin } from "lucide-react"

interface Order {
  _id: string
  quantity: number
  productName: string
  orderStatus: string
  productPrice: number
  vendorId: {
    _id: string
    name: string
    shopAddress: string
  }
  productId: {
    _id: string
    productName: string
    imageUrl: string
  }
  customerId: {
    _id: string
    name: string
    email: string
    mobileNo: string
  }
  createdAt: string
  updatedAt: string
}

export default function OrderPage({ params }: { params: { orderId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    fetchOrder()
  }, [session, status, router, params.orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/order/${params.orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        console.error("Failed to fetch order")
        router.push("/customer/dashboard")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/customer/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
        <Link href="/customer/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/customer/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600">Order ID: {order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(order.orderStatus)}
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(order.orderStatus)}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">
                  Last updated: {new Date(order.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={order.productId.imageUrl || "/placeholder.svg"}
                    alt={order.productName}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${order.productId._id}`} className="font-semibold text-lg hover:text-blue-600">
                    {order.productName}
                  </Link>
                  <p className="text-gray-600 mt-1">Quantity: {order.quantity}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">₹{order.productPrice.toLocaleString()} each</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{order.vendorId.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <span className="text-gray-600">{order.vendorId.shopAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Item Price</span>
                  <span>₹{order.productPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span>{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(order.productPrice * order.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{(order.productPrice * order.quantity).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2 text-sm text-gray-600">
                <p>Order placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Expected delivery: 3-5 business days</p>
              </div>

              {order.orderStatus === "delivered" && (
                <Button className="w-full bg-transparent" variant="outline">
                  Rate & Review
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

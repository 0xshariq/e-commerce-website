"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from "lucide-react"

export default function ProductSalesPage({ params }: { params: { productId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session?.user?.role !== "vendor") {
      router.push("/")
      return
    }

    setLoading(false)
  }, [session, status, router])

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/products/${params.productId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Product
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Sales</h1>
          <p className="text-gray-600">Manage sales and promotions for this product</p>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,350</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sale Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 days</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sales */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Sales</CardTitle>
            <Button>Create New Sale</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Summer Sale 2024</h3>
                <p className="text-sm text-gray-600">25% off on all items</p>
                <p className="text-xs text-gray-500">Valid until: Dec 31, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Flash Sale</h3>
                <p className="text-sm text-gray-600">₹500 off on orders above ₹2000</p>
                <p className="text-xs text-gray-500">Valid until: Dec 25, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Scheduled</Badge>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Diwali Special</h3>
                <p className="text-sm text-gray-600">30% off - Completed</p>
                <p className="text-xs text-gray-500">Oct 1 - Oct 31, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">₹15,000 saved</p>
                <p className="text-xs text-gray-500">45 orders</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Back to School</h3>
                <p className="text-sm text-gray-600">20% off - Completed</p>
                <p className="text-xs text-gray-500">Aug 1 - Aug 31, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">₹8,500 saved</p>
                <p className="text-xs text-gray-500">28 orders</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

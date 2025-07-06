"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Tag, Copy, Plus, Search } from "lucide-react"
import { toast } from "sonner"

export default function ProductCouponPage({ params }: { params: { productId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Coupon code copied!")
  }

  const coupons = [
    {
      id: "1",
      code: "SAVE20",
      discountType: "percentage",
      discount: 20,
      expiryDate: "2024-12-31",
      useLimit: 100,
      usedCount: 45,
      status: "active",
    },
    {
      id: "2",
      code: "FLAT500",
      discountType: "amount",
      discount: 500,
      expiryDate: "2024-12-25",
      useLimit: 50,
      usedCount: 12,
      status: "active",
    },
    {
      id: "3",
      code: "WELCOME10",
      discountType: "percentage",
      discount: 10,
      expiryDate: "2024-11-30",
      useLimit: 200,
      usedCount: 200,
      status: "expired",
    },
  ]

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchTerm.toLowerCase()))

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Product Coupons</h1>
          <p className="text-gray-600">Manage discount coupons for this product</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupon Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.filter((c) => c.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm font-semibold">{coupon.code}</code>
                    <Badge variant={coupon.status === "active" ? "default" : "secondary"}>{coupon.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {coupon.discountType === "percentage" ? `${coupon.discount}% off` : `₹${coupon.discount} off`}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                    <span>
                      Used: {coupon.usedCount}/{coupon.useLimit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyCoupon(coupon.code)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

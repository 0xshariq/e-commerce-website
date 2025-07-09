"use client"

import { Button } from "@/components/ui/button"
import { Plus, Edit, Package, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function QuickActions() {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Link href="/vendor/products/create">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
        <Link href="/vendor/products">
          <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
            <Package className="h-4 w-4 mr-2" />
            Manage Products
          </Button>
        </Link>
        <Link href="/vendor/orders">
          <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Orders
          </Button>
        </Link>
        <Link href="/vendor/profile">
          <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}

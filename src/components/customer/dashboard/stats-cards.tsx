"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Heart, Package, MapPin, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalOrders: number
    wishlistCount: number
    totalSpent: number
    savedAddresses: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Orders</CardTitle>
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalOrders}</div>
          <p className="text-xs text-gray-400">+2 from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Wishlist Items</CardTitle>
          <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.wishlistCount}</div>
          <p className="text-xs text-gray-400">Items you're interested in</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Spent</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">₹{stats.totalSpent}</div>
          <p className="text-xs text-gray-400">This quarter</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700 hover:bg-gray-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Saved Addresses</CardTitle>
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.savedAddresses}</div>
          <p className="text-xs text-gray-400">Delivery locations</p>
        </CardContent>
      </Card>
    </div>
  )
}

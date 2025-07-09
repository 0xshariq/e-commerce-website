"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function RevenueOverviewCard() {
  return (
    <Card className="xl:col-span-2 bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Revenue Overview</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Monthly revenue and growth trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm sm:text-base">Revenue Chart</p>
            <p className="text-xs sm:text-sm text-gray-500">Chart library integration needed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

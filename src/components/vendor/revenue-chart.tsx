"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface MonthlyRevenue {
  month: string
  revenue: number
}

export default function RevenueChart() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      const response = await fetch("/api/vendor/orders")
      if (response.ok) {
        const data = await response.json()
        const orders = data.orders || []

        // Calculate monthly revenue for last 6 months
        const monthlyData = []
        const currentDate = new Date()
        
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
          const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1)
          
          const monthOrders = orders.filter((order: any) => {
            const orderDate = new Date(order.createdAt)
            return orderDate >= month && orderDate < nextMonth && order.orderStatus === "delivered"
          })
          
          const monthRevenue = monthOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
          
          monthlyData.push({
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            revenue: monthRevenue
          })
        }
        
        setMonthlyRevenue(monthlyData)
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="lg:col-span-2 bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-700/50 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = Math.max(...monthlyRevenue.map(d => d.revenue))

  return (
    <Card className="lg:col-span-2 bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Revenue Trend (Last 6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {monthlyRevenue.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t min-h-[20px] transition-all hover:from-blue-500 hover:to-blue-300"
                style={{ 
                  height: `${Math.max(20, maxRevenue > 0 ? (data.revenue / maxRevenue) * 200 : 20)}px` 
                }}
                title={`₹${data.revenue.toLocaleString()}`}
              />
              <span className="text-xs text-gray-400 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

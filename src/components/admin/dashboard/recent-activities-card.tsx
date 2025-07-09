"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, AlertTriangle, ShoppingCart, UserX, Users } from "lucide-react"

interface RecentActivitiesProps {
  activities: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    type: "vendor" | "flag" | "order" | "suspend" | "user";
  }> | undefined;
}

export default function RecentActivitiesCard({ activities = [] }: RecentActivitiesProps) {
  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Recent Activities</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Latest platform activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {activities?.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {activity.type === "vendor" && (
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
              )}
              {activity.type === "flag" && (
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
              )}
              {activity.type === "order" && (
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
              )}
              {activity.type === "suspend" && (
                <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
              )}
              {activity.type === "user" && (
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base truncate">{activity.action}</p>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{activity.user}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { UserCheck, AlertTriangle, Users, BarChart3 } from "lucide-react"

interface QuickActionsProps {
  stats: {
    pendingVendors: number;
    flaggedProducts: number;
  } | undefined;
}

export default function QuickActions({ stats }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Button 
        className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
        onClick={() => document.getElementById('pending-vendors')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
        Approve Vendors ({stats?.pendingVendors || 0})
      </Button>
      <Button 
        className="h-16 sm:h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
        onClick={() => document.getElementById('flagged-products')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
        Review Products ({stats?.flaggedProducts || 0})
      </Button>
      <Button 
        className="h-16 sm:h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
        onClick={() => window.location.href = "/admin/users"}
      >
        <Users className="h-4 w-4 sm:h-5 sm:w-5" />
        User Management
      </Button>
      <Button 
        className="h-16 sm:h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
        onClick={() => window.location.href = "/admin/analytics"}
      >
        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
        Analytics
      </Button>
    </div>
  )
}

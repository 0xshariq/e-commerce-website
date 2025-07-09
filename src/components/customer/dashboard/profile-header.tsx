"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"
import { formatCurrency } from "@/utils/formatting"

interface CustomerProfileHeaderProps {
  customerName: string
  profile?: {
    firstName: string
    lastName: string
    membershipTier: string
    loyaltyPoints: number
  }
}

export default function ProfileHeader({ customerName, profile }: CustomerProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Welcome back, {profile?.firstName || customerName}!
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Here's what's happening with your account today.
        </p>
        {profile?.membershipTier && (
          <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
            <Gift className="h-3 w-3 mr-1" />
            {profile.membershipTier.charAt(0).toUpperCase() + profile.membershipTier.slice(1)} Member
          </Badge>
        )}
      </div>
      {profile?.loyaltyPoints && (
        <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{profile.loyaltyPoints}</div>
            <p className="text-xs text-gray-400">Loyalty Points</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

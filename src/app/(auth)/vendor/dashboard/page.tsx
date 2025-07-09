import { getServerSession } from "next-auth/next"
import type { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import VendorDashboardContent from "@/components/vendor/dashboard/vendor-dashboard-content"

export default async function VendorDashboard() {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "vendor") {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <VendorDashboardContent vendorName={session.user.name || "Vendor"} />
      </div>
    </div>
  )
}

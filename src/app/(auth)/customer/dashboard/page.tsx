import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CustomerDashboardContent from "@/components/customer/dashboard-content"

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "customer") {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CustomerDashboardContent customerName={session.user.name || "Customer"} />
      </div>
    </div>
  )
}

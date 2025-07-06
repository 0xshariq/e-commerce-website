import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import VendorProfileForm from "@/components/vendor/profile-form"

export default async function VendorProfile() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== "vendor") {
    redirect("/auth/signin")
  }

  return <VendorProfileForm />
}

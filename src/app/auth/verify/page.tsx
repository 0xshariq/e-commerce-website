"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail, 
  Phone, 
  ChevronLeft, 
  Shield, 
  AlertCircle,
  CheckCircle,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import EmailVerification from "@/components/email-verification"
import MobileVerification from "@/components/mobile-verification"

export default function VerifyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // If user is not logged in, redirect to sign in
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check verification status
      checkVerificationStatus()
    }
  }, [status, router])

  const checkVerificationStatus = async () => {
    setIsLoading(true)
    try {
      // Check email verification status
      const emailResponse = await fetch("/api/verify/email")
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setEmailVerified(emailData.emailVerified)
      }

      // Check phone verification status
      const phoneResponse = await fetch("/api/verify/mobile")
      if (phoneResponse.ok) {
        const phoneData = await phoneResponse.json()
        setPhoneVerified(phoneData.phoneVerified)
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
      setError("Failed to load verification status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailVerified = () => {
    setEmailVerified(true)
  }

  const handlePhoneVerified = () => {
    setPhoneVerified(true)
  }

  const continueToDashboard = () => {
    const role = session?.user?.role || 'customer'
    switch (role) {
      case 'vendor':
        router.push('/vendor/dashboard')
        break
      case 'admin':
        router.push('/admin/dashboard')
        break
      default:
        router.push('/customer/dashboard')
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            <CardDescription>
              Please wait while we check your verification status
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // If both are verified, show success and redirect
  if (emailVerified && phoneVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">All Set!</CardTitle>
            <CardDescription className="text-lg">
              Your account is fully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span>Email Address</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              
              <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Mobile Number</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
            
            <Button 
              onClick={continueToDashboard} 
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Account</CardTitle>
          <CardDescription>
            Complete verification to secure your account and access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={emailVerified ? "phone" : "email"}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="email" disabled={emailVerified} className="relative">
                Email
                {emailVerified && (
                  <span className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="phone" disabled={phoneVerified} className="relative">
                Mobile
                {phoneVerified && (
                  <span className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              {!emailVerified ? (
                <EmailVerification
                  onVerificationComplete={handleEmailVerified}
                  showTitle={false}
                />
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Email Verified!</h3>
                  <p className="text-muted-foreground mt-2">
                    Your email has been successfully verified.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="phone">
              {!phoneVerified ? (
                <MobileVerification
                  onVerificationComplete={handlePhoneVerified}
                  showTitle={false}
                />
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Mobile Verified!</h3>
                  <p className="text-muted-foreground mt-2">
                    Your mobile number has been successfully verified.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/signin">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

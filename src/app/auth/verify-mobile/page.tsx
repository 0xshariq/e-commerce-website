"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Phone, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyMobilePage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Handle URL parameters
    const emailParam = searchParams.get('email')
    const mobileParam = searchParams.get('mobile')
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const role = searchParams.get('role')

    if (emailParam) {
      setEmail(emailParam)
    }

    if (mobileParam) {
      setMobile(mobileParam)
    }

    if (successParam) {
      setIsSuccess(true)
      if (successParam === 'verified') {
        setMessage(`Mobile verified successfully! Your ${role || 'account'} is now verified.`)
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
          switch (role) {
            case 'customer':
              router.push('/customer/dashboard')
              break
            case 'vendor':
              router.push('/vendor/dashboard')
              break
            case 'admin':
              router.push('/admin/dashboard')
              break
            default:
              router.push('/auth/signin')
          }
        }, 3000)
      } else if (successParam === 'already-verified') {
        setMessage("Your mobile number is already verified.")
      }
    }

    if (errorParam) {
      setIsError(true)
      switch (errorParam) {
        case 'user-not-found':
          setMessage("User account not found.")
          break
        case 'invalid-code':
          setMessage("Invalid verification code. Please try again.")
          break
        case 'expired-code':
          setMessage("Verification code has expired. Please request a new one.")
          break
        case 'server-error':
          setMessage("An error occurred during verification. Please try again.")
          break
        default:
          setMessage("An unknown error occurred.")
      }
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !verificationCode) {
      setMessage("Please enter both email and verification code")
      setIsError(true)
      return
    }

    setIsLoading(true)
    setMessage("")
    setIsError(false)

    try {
      const response = await fetch('/api/verify/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: "verify-otp",
          phoneNumber: mobile,
          otpCode: verificationCode,
          email: email, // Include email for user identification
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message)
        
        // Redirect to appropriate dashboard after 3 seconds
        setTimeout(() => {
          switch (data.role) {
            case 'customer':
              router.push('/customer/dashboard')
              break
            case 'vendor':
              router.push('/vendor/dashboard')
              break
            case 'admin':
              router.push('/admin/dashboard')
              break
            default:
              router.push('/auth/signin')
          }
        }, 3000)
      } else {
        setIsError(true)
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setIsError(true)
      setMessage('An error occurred. Please try again.')
      console.error('Verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!mobile) {
      setMessage("Mobile number not found. Please try registering again.")
      setIsError(true)
      return
    }

    setIsLoading(true)
    setMessage("Resending verification code...")
    setIsError(false)

    try {
      const response = await fetch('/api/verify/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: "send-otp",
          phoneNumber: mobile,
          channel: "sms"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Verification code sent! Please check your mobile.")
        setIsSuccess(true)
      } else {
        setIsError(true)
        setMessage(data.error || 'Failed to resend code')
      }
    } catch (error) {
      setIsError(true)
      setMessage('Failed to resend code. Please try again.')
      console.error('Resend code error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Mobile</CardTitle>
          <CardDescription>
            Enter the verification code sent to your mobile number to complete your account setup.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert className={`${isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={isSuccess ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-sm text-gray-600">
                  Check your mobile for a 6-digit verification code
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Mobile"
                )}
              </Button>
            </form>
          )}

          {!isSuccess && (
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600">
                Didn't receive the code?
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend Verification Code"}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <Link href="/auth/signin" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>

          {isSuccess && (
            <div className="text-center text-sm text-gray-600">
              Redirecting to your dashboard in a few seconds...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

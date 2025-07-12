"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Shield 
} from "lucide-react"

interface EmailVerificationProps {
  initialEmail?: string
  onVerificationComplete?: (email: string) => void
  showTitle?: boolean
  compact?: boolean
  required?: boolean
}

export default function EmailVerification({
  initialEmail = "",
  onVerificationComplete,
  showTitle = true,
  compact = false,
  required = false
}: EmailVerificationProps) {
  const [email, setEmail] = useState(initialEmail)
  const [otpCode, setOtpCode] = useState("")
  const [step, setStep] = useState<"email" | "otp" | "verified">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [statusMessage, setStatusMessage] = useState("")

  // Check if email is already verified on component mount
  useEffect(() => {
    checkVerificationStatus()
  }, [])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch("/api/verify/email")
      if (response.ok) {
        const data = await response.json()
        if (data.emailVerified) {
          setEmail(data.email || "")
          setStep("verified")
          if (onVerificationComplete) {
            onVerificationComplete(data.email)
          }
        } else if (data.email) {
          setEmail(data.email)
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
    }
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const sendOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/verify/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send-otp",
          email: email.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`OTP sent to ${email}`)
        setStep("otp")
        setTimeLeft(60) // 60 seconds before allowing resend
        setCanResend(false)
        
        // For development environments, auto-fill OTP if provided by backend
        if (process.env.NODE_ENV === 'development' && data.otpCode) {
          setOtpCode(data.otpCode)
          console.log('[Dev Mode] Auto-filled OTP:', data.otpCode)
        }
        
        // Display a more visible message that we're waiting for the OTP
        setStatusMessage(`Please check your email for the verification code.`)
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify-otp",
          email: email.trim(),
          code: otpCode.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Email address verified successfully!")
        setStep("verified")
        setStatusMessage("") // Clear status message on success
        if (onVerificationComplete) {
          onVerificationComplete(email)
        }
      } else {
        setError(data.error || "Invalid or expired OTP code. Please try again.")
        setStatusMessage("Verification failed. Please check the code and try again.")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    if (!canResend) return
    setStatusMessage("Resending verification code...")
    await sendOTP()
  }

  const changeEmail = () => {
    setStep("email")
    setOtpCode("")
    setError("")
    setSuccess("")
  }

  // Email entry form
  const EmailForm = (
    <form onSubmit={(e) => { e.preventDefault(); sendOTP() }}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>Send Verification Code</>
          )}
        </Button>
        
        {required && (
          <div className="text-center mt-4">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Verification Required
            </Badge>
          </div>
        )}
      </div>
    </form>
  )
  
  // OTP verification form
  const OTPForm = (
    <form onSubmit={(e) => { e.preventDefault(); verifyOTP() }}>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="otp">Verification Code</Label>
            <span className="text-xs text-muted-foreground">
              Sent to {email}
            </span>
          </div>
          
          <Input
            id="otp"
            className="text-center text-xl tracking-widest mt-2"
            maxLength={6}
            inputMode="numeric"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • • • •"
            autoComplete="one-time-code"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>Verify Code</>
          )}
        </Button>
        
        <div className="flex flex-col space-y-2 text-center text-sm">
          <p>
            {canResend ? (
              <Button variant="ghost" size="sm" onClick={resendOTP}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Resend code
              </Button>
            ) : (
              <span className="text-muted-foreground">
                Resend available in {timeLeft}s
              </span>
            )}
          </p>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={changeEmail}
          >
            Change email address
          </Button>
        </div>
      </div>
    </form>
  )

  // Verified state
  const VerifiedState = (
    <div className="text-center space-y-4">
      <div className="mx-auto bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-green-700">Email Verified</h3>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
        <Shield className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    </div>
  )

  return (
    <Card className={compact ? "shadow-none border-0" : ""}>
      {(showTitle && !compact) && (
        <CardHeader className={compact ? "px-0 pt-0" : ""}>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Verification
          </CardTitle>
          <CardDescription>
            Verify your email address to secure your account
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={compact ? "px-0 pt-0" : ""}>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {statusMessage && (
          <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-100">
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
        
        {step === "email" && EmailForm}
        {step === "otp" && OTPForm}
        {step === "verified" && VerifiedState}
      </CardContent>
    </Card>
  )
}

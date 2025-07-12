"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Shield 
} from "lucide-react"

interface MobileVerificationProps {
  initialPhoneNumber?: string
  onVerificationComplete?: (phoneNumber: string) => void
  showTitle?: boolean
  compact?: boolean
  required?: boolean
}

export default function MobileVerification({
  initialPhoneNumber = "",
  onVerificationComplete,
  showTitle = true,
  compact = false,
  required = false
}: MobileVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [otpCode, setOtpCode] = useState("")
  const [step, setStep] = useState<"phone" | "otp" | "verified">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [verificationChannel, setVerificationChannel] = useState<"sms" | "whatsapp">("sms")
  const [statusMessage, setStatusMessage] = useState("")

  // Check if phone is already verified on component mount
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
      const response = await fetch("/api/verify/mobile")
      if (response.ok) {
        const data = await response.json()
        if (data.phoneVerified) {
          setPhoneNumber(data.phoneNumber || "")
          setStep("verified")
          if (onVerificationComplete) {
            onVerificationComplete(data.phoneNumber)
          }
        } else if (data.phoneNumber) {
          setPhoneNumber(data.phoneNumber)
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
    }
  }

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned)
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2')
    }
    return phone
  }

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your mobile number")
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Indian mobile number")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/verify/mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send-otp",
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          channel: "sms" // Always use SMS for now
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`OTP sent to ${phoneNumber} via SMS`)
        setStep("otp")
        setTimeLeft(60) // 60 seconds before allowing resend
        setCanResend(false)
        
        // For development environments, auto-fill OTP if provided by backend
        if (process.env.NODE_ENV === 'development' && data.otpCode) {
          setOtpCode(data.otpCode)
          console.log('[Dev Mode] Auto-filled OTP:', data.otpCode)
        }
        
        // Display a more visible message that we're waiting for the OTP
        setStatusMessage(`Please check your phone for the verification code.`)
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
      const response = await fetch("/api/verify/mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify-otp",
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          otpCode: otpCode
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Mobile number verified successfully!")
        setStep("verified")
        setStatusMessage("") // Clear status message on success
        if (onVerificationComplete) {
          onVerificationComplete(phoneNumber)
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

  const changePhoneNumber = () => {
    setStep("phone")
    setOtpCode("")
    setError("")
    setSuccess("")
    setStatusMessage("")
  }

  if (compact && step === "verified") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-green-600">Mobile Verified</span>
        <Badge variant="outline" className="text-xs">
          {formatPhoneNumber(phoneNumber)}
        </Badge>
      </div>
    )
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Mobile Verification
          </CardTitle>
          <CardDescription>
            Secure your account with mobile number verification
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === "phone" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Mobile Number {required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                  <span className="text-sm text-gray-600">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhoneNumber(value)
                    setError("")
                  }}
                  className="rounded-l-none"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-gray-500">
                We'll send an OTP to verify your mobile number
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Verification method:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  SMS
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp (Coming soon)
                </Button>
              </div>
            </div>

            <Button
              onClick={sendOTP}
              disabled={loading || !phoneNumber || phoneNumber.length !== 10}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                OTP sent to <strong>+91 {formatPhoneNumber(phoneNumber)}</strong>
              </p>
              {statusMessage && (
                <Badge variant="outline" className="flex items-center gap-1 mx-auto">
                  <MessageSquare className="h-3 w-3" />
                  {statusMessage}
                </Badge>
              )}
              <Button
                variant="link"
                onClick={changePhoneNumber}
                className="text-xs h-auto p-0"
              >
                Change number
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtpCode(value)
                  setError("")
                }}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={verifyOTP}
                disabled={loading || otpCode.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify OTP
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={resendOTP}
                disabled={!canResend || loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {timeLeft > 0 ? `${timeLeft}s` : "Resend"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Didn't receive the OTP? Check your messages or try resending.
            </p>
          </div>
        )}

        {step === "verified" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Mobile Verified!</h3>
              <p className="text-sm text-gray-600">
                Your mobile number <strong>+91 {formatPhoneNumber(phoneNumber)}</strong> has been verified successfully.
              </p>
            </div>
            {!compact && (
              <Button
                variant="outline"
                onClick={changePhoneNumber}
                className="text-sm"
              >
                Change Mobile Number
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

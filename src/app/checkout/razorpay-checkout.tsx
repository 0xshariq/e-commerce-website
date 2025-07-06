"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Wallet, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react"

interface RazorpayCheckoutProps {
  orderId: string
  amount: number
  currency?: string
  onSuccess?: (paymentData: any) => void
  onFailure?: (error: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayCheckout({
  orderId,
  amount,
  currency = "INR",
  onSuccess,
  onFailure
}: RazorpayCheckoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("upi")
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => setRazorpayLoaded(true)
      script.onerror = () => {
        toast.error("Failed to load payment gateway")
      }
      document.body.appendChild(script)
    } else {
      setRazorpayLoaded(true)
    }
  }, [])

  // Fetch order details
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data.order)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  const initializePayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway not ready. Please try again.")
      return
    }

    if (!session) {
      toast.error("Please login to continue payment")
      router.push("/auth/signin")
      return
    }

    setLoading(true)

    try {
      // Create payment with backend
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentMethod,
          currency,
          convenienceFee: calculateConvenienceFee(amount, paymentMethod),
          tax: calculateTax(amount),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to initialize payment")
      }

      const paymentData = await response.json()

      // Create Razorpay order
      const razorpayResponse = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentData.payment.totalAmount * 100, // Razorpay expects amount in paise
          currency,
          receipt: paymentData.payment._id,
        }),
      })

      if (!razorpayResponse.ok) {
        throw new Error("Failed to create Razorpay order")
      }

      const razorpayOrder = await razorpayResponse.json()

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopHub",
        description: `Payment for Order #${orderDetails?.orderNumber || orderId}`,
        image: "/favicon.ico",
        order_id: razorpayOrder.id,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: orderDetails?.shippingAddress?.phone || "",
        },
        theme: {
          color: "#f97316", // Orange color
        },
        method: getEnabledMethods(paymentMethod),
        handler: async function (response: any) {
          await handlePaymentSuccess(response, paymentData.payment._id)
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            toast.error("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error: any) {
      console.error("Payment initialization error:", error)
      toast.error(error.message || "Failed to initialize payment")
      if (onFailure) {
        onFailure(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (response: any, paymentId: string) => {
    try {
      setLoading(true)

      // Verify payment with backend
      const verifyResponse = await fetch("/api/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          action: "verify",
          data: {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          },
        }),
      })

      if (verifyResponse.ok) {
        toast.success("Payment successful!")
        if (onSuccess) {
          onSuccess(response)
        } else {
          router.push(`/order/${orderId}?payment=success`)
        }
      } else {
        throw new Error("Payment verification failed")
      }
    } catch (error: any) {
      console.error("Payment verification error:", error)
      toast.error("Payment verification failed")
      if (onFailure) {
        onFailure(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateConvenienceFee = (amount: number, method: string) => {
    switch (method) {
      case "upi":
        return 0 // Free UPI
      case "card":
        return Math.round(amount * 0.02) // 2% for cards
      case "netbanking":
        return Math.round(amount * 0.015) // 1.5% for net banking
      case "wallet":
        return Math.round(amount * 0.01) // 1% for wallets
      default:
        return 0
    }
  }

  const calculateTax = (amount: number) => {
    return Math.round(amount * 0.18) // 18% GST
  }

  const getEnabledMethods = (method: string) => {
    switch (method) {
      case "upi":
        return {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
        }
      case "card":
        return {
          card: true,
          upi: false,
          netbanking: false,
          wallet: false,
        }
      case "netbanking":
        return {
          netbanking: true,
          upi: false,
          card: false,
          wallet: false,
        }
      case "wallet":
        return {
          wallet: true,
          upi: false,
          card: false,
          netbanking: false,
        }
      default:
        return {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        }
    }
  }

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      description: "Pay using UPI ID or scan QR code",
      icon: Smartphone,
      fee: 0,
      popular: true,
    },
    {
      id: "card",
      name: "Card",
      description: "Credit/Debit cards",
      icon: CreditCard,
      fee: calculateConvenienceFee(amount, "card"),
    },
    {
      id: "netbanking",
      name: "Net Banking",
      description: "Pay using internet banking",
      icon: Banknote,
      fee: calculateConvenienceFee(amount, "netbanking"),
    },
    {
      id: "wallet",
      name: "Wallet",
      description: "Paytm, PhonePe, Amazon Pay",
      icon: Wallet,
      fee: calculateConvenienceFee(amount, "wallet"),
    },
  ]

  const convenienceFee = calculateConvenienceFee(amount, paymentMethod)
  const tax = calculateTax(amount)
  const totalAmount = amount + convenienceFee + tax

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Select Payment Method
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose your preferred payment option
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                paymentMethod === method.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
              }`}
              onClick={() => setPaymentMethod(method.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  paymentMethod === method.id
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-gray-600/50 text-gray-400"
                }`}>
                  <method.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{method.name}</span>
                    {method.popular && (
                      <Badge className="bg-green-600 text-white text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{method.description}</p>
                </div>
              </div>
              <div className="text-right">
                {method.fee > 0 ? (
                  <div className="text-orange-400 text-sm">
                    +₹{method.fee} fee
                  </div>
                ) : (
                  <div className="text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Free
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>Order Amount</span>
            <span>₹{amount.toFixed(2)}</span>
          </div>
          
          {convenienceFee > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Convenience Fee</span>
              <span>₹{convenienceFee.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-gray-300">
            <span>GST (18%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          
          <div className="border-t border-gray-600 pt-3">
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Alert className="bg-green-900/20 border-green-600/30">
        <Shield className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          Your payment is secured with 256-bit SSL encryption and processed by Razorpay.
        </AlertDescription>
      </Alert>

      {/* Pay Now Button */}
      <Button
        onClick={initializePayment}
        disabled={loading || !razorpayLoaded}
        size="lg"
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : !razorpayLoaded ? (
          <>
            <Clock className="h-5 w-5 mr-2" />
            Loading Payment Gateway...
          </>
        ) : (
          <>
            <Shield className="h-5 w-5 mr-2" />
            Pay ₹{totalAmount.toFixed(2)} Securely
          </>
        )}
      </Button>

      {/* Payment Options Info */}
      <div className="text-center text-sm text-gray-400">
        <p>Powered by Razorpay | PCI DSS Compliant</p>
        <p className="mt-1">
          Supports UPI, Credit/Debit Cards, Net Banking, and Digital Wallets
        </p>
      </div>
    </div>
  )
}
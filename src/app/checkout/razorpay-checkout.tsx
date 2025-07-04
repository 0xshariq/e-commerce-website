"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Smartphone, Building2, Wallet, ShoppingCart, MapPin, Truck, Shield } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

const paymentOptions = [
  {
    value: "upi",
    label: "UPI / Google Pay",
    icon: Smartphone,
    description: "Pay using UPI, Google Pay, PhonePe",
  },
  {
    value: "card",
    label: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, MasterCard, RuPay, Amex",
    brands: [
      { value: "visa", label: "Visa" },
      { value: "mastercard", label: "MasterCard" },
      { value: "rupay", label: "RuPay" },
      { value: "amex", label: "Amex" },
    ],
  },
  {
    value: "netbanking",
    label: "Net Banking",
    icon: Building2,
    description: "All major banks supported",
  },
  {
    value: "wallet",
    label: "Digital Wallet",
    icon: Wallet,
    description: "Paytm, Mobikwik, Amazon Pay",
  },
]

interface CartItem {
  _id: string
  productId: {
    _id: string
    productName: string
    productPrice: number
    imageUrl: string
    vendorId: {
      businessName: string
      shopAddress: string
    }
  }
  quantity: number
}

interface ShippingAddress {
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  landmark: string
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("upi")
  const [selectedCardBrand, setSelectedCardBrand] = useState("visa")
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.productId.productPrice * item.quantity, 0)
  const shippingCost = subtotal > 500 ? 0 : 50
  const tax = Math.round(subtotal * 0.18)
  const finalAmount = subtotal + shippingCost + tax - discount

  useEffect(() => {
    if (!session || session.user.role !== "customer") {
      router.push("/customer/signin")
      return
    }
    fetchCartItems()
  }, [session])

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.cartItems || [])

        // Pre-fill address from user session
        if (session?.user) {
          setShippingAddress((prev) => ({
            ...prev,
            fullName: session.user.name || "",
            email: session.user.email || "",
          }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error)
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const validateAddress = () => {
    const required = ["fullName", "phone", "email", "addressLine1", "city", "state", "pincode"]
    return required.every((field) => shippingAddress[field as keyof ShippingAddress].trim() !== "")
  }

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve()
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!validateAddress()) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all required address fields",
        variant: "destructive",
      })
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      if (!window.Razorpay) {
        await loadRazorpayScript()
      }

      // Create order first
      const orderResponse = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
          })),
          shippingAddress,
          paymentMethod: selectedPayment,
          specialInstructions: "",
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const { orders } = await orderResponse.json()
      const mainOrder = orders[0] // Use first order for payment

      // Create Razorpay payment
      const paymentResponse = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: mainOrder._id,
          amount: finalAmount,
          paymentOption: selectedPayment,
          cardBrand: selectedPayment === "card" ? selectedCardBrand : undefined,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment")
      }

      const paymentData = await paymentResponse.json()

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "E-Commerce Store",
        description: `Payment for ${cartItems.length} items`,
        order_id: paymentData.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/razorpay", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentOption: selectedPayment,
                cardBrand: selectedPayment === "card" ? selectedCardBrand : undefined,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed")
            }

            toast({
              title: "Payment Successful!",
              description: "Your order has been placed successfully",
            })

            router.push(`/order/${mainOrder._id}`)
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support",
              variant: "destructive",
            })
          }
        },
        prefill: paymentData.prefill,
        theme: { color: "#3182ce" },
        method: {
          upi: selectedPayment === "upi",
          card: selectedPayment === "card",
          netbanking: selectedPayment === "netbanking",
          wallet: selectedPayment === "wallet",
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading checkout...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
                <CardDescription className="text-gray-400">Where should we deliver your order?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange("fullName", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine1" className="text-gray-300">
                    Address Line 1 *
                  </Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="House/Flat number, Street name"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2" className="text-gray-300">
                    Address Line 2
                  </Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Area, Colony (Optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-gray-300">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-300">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-gray-300">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleAddressChange("pincode", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="landmark" className="text-gray-300">
                    Landmark
                  </Label>
                  <Input
                    id="landmark"
                    value={shippingAddress.landmark}
                    onChange={(e) => handleAddressChange("landmark", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nearby landmark (Optional)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription className="text-gray-400">Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <div
                        key={option.value}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedPayment === option.value
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                        }`}
                        onClick={() => setSelectedPayment(option.value)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{option.label}</p>
                            <p className="text-gray-400 text-sm">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedPayment === "card" && (
                  <div className="mt-4">
                    <Label className="text-gray-300 mb-2 block">Select Card Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {paymentOptions
                        .find((opt) => opt.value === "card")
                        ?.brands?.map((brand) => (
                          <Button
                            key={brand.value}
                            variant={selectedCardBrand === brand.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCardBrand(brand.value)}
                            className="text-xs"
                          >
                            {brand.label}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription className="text-gray-400">{cartItems.length} items in your cart</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.productId.productName}</p>
                      <p className="text-gray-400 text-xs">
                        Qty: {item.quantity} × ₹{item.productId.productPrice}
                      </p>
                      <p className="text-gray-400 text-xs">by {item.productId.vendorId.businessName}</p>
                    </div>
                    <div className="text-white font-medium">
                      ₹{(item.productId.productPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-400" : ""}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator className="bg-gray-600" />

                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>

                {shippingCost === 0 && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders above ₹500</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-center">
                  <Shield className="h-8 w-8 text-green-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium">Secure Payment</p>
                    <p className="text-gray-400 text-sm">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              onClick={handlePayment}
              disabled={processing || cartItems.length === 0}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
            >
              {processing ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₹{finalAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  
  // Payment Details
  amount: number
  currency: string
  convenienceFee: number
  tax: number
  totalAmount: number
  
  // Razorpay Integration
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  
  // Payment Method & Status
  paymentMethod: "upi" | "netbanking" | "card" | "wallet" | "paylater"
  paymentGateway: "razorpay"
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded"
  
  // UPI Details (primary focus)
  upiDetails?: {
    vpa?: string
    provider?: string
    transactionId?: string
  }
  
  // Card Details (for non-UPI)
  cardDetails?: {
    last4?: string
    brand?: string
    type?: string
    network?: string
  }
  
  // Transaction Timeline
  initiatedAt: Date
  completedAt?: Date
  failedAt?: Date
  
  // Metadata
  ipAddress?: string
  userAgent?: string
  deviceId?: string
  
  // Refund Information
  refundStatus?: "none" | "partial" | "full" | "processing"
  refundAmount?: number
  refundReason?: string
  refundId?: string
  
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    
    // Payment Details
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
      enum: ["INR", "USD"],
    },
    convenienceFee: {
      type: Number,
      default: 0,
      min: [0, "Convenience fee must be positive"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax must be positive"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be positive"],
    },
    
    // Razorpay Integration
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay order ID is required"],
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    razorpaySignature: {
      type: String,
    },
    
    // Payment Method & Status
    paymentMethod: {
      type: String,
      enum: ["upi", "netbanking", "card", "wallet", "paylater"],
      required: [true, "Payment method is required"],
    },
    paymentGateway: {
      type: String,
      default: "razorpay",
      enum: ["razorpay"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    
    // UPI Details
    upiDetails: {
      vpa: { type: String },
      provider: { type: String },
      transactionId: { type: String },
    },
    
    // Card Details
    cardDetails: {
      last4: { type: String },
      brand: { type: String },
      type: { type: String },
      network: { type: String },
    },
    
    // Transaction Timeline
    initiatedAt: {
      type: Date,
      required: [true, "Initiated time is required"],
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    
    // Metadata
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceId: { type: String },
    
    // Refund Information
    refundStatus: {
      type: String,
      enum: ["none", "partial", "full", "processing"],
      default: "none",
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount must be positive"],
    },
    refundReason: { type: String },
    refundId: { type: String },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
PaymentSchema.index({ customerId: 1, paymentStatus: 1 })
PaymentSchema.index({ vendorId: 1, paymentStatus: 1 })
PaymentSchema.index({ razorpayOrderId: 1 })
PaymentSchema.index({ razorpayPaymentId: 1 })
PaymentSchema.index({ createdAt: -1 })

// Zod Schema for validation
export const PaymentZodSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  
  // Payment Details
  amount: z.number().min(0.01, "Amount must be positive"),
  currency: z.enum(["INR", "USD"]).default("INR"),
  convenienceFee: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  totalAmount: z.number().min(0.01, "Total amount must be positive"),
  
  // Razorpay Integration
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  
  // Payment Method & Status
  paymentMethod: z.enum(["upi", "netbanking", "card", "wallet", "paylater"]),
  paymentGateway: z.enum(["razorpay"]).default("razorpay"),
  paymentStatus: z.enum(["pending", "processing", "completed", "failed", "cancelled", "refunded"]).default("pending"),
  
  // UPI Details
  upiDetails: z.object({
    vpa: z.string().optional(),
    provider: z.string().optional(),
    transactionId: z.string().optional(),
  }).optional(),
  
  // Card Details
  cardDetails: z.object({
    last4: z.string().optional(),
    brand: z.string().optional(),
    type: z.string().optional(),
    network: z.string().optional(),
  }).optional(),
  
  // Transaction Timeline
  initiatedAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
  failedAt: z.date().optional(),
  
  // Metadata
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  
  // Refund Information
  refundStatus: z.enum(["none", "partial", "full", "processing"]).default("none"),
  refundAmount: z.number().min(0).optional(),
  refundReason: z.string().optional(),
  refundId: z.string().optional(),
})

export const PaymentCreateZodSchema = PaymentZodSchema.pick({
  orderId: true,
  customerId: true,
  vendorId: true,
  amount: true,
  currency: true,
  convenienceFee: true,
  tax: true,
  totalAmount: true,
  paymentMethod: true,
  ipAddress: true,
  userAgent: true,
  deviceId: true,
})

export const PaymentUpdateZodSchema = PaymentZodSchema.partial()

export const PaymentVerificationZodSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
  paymentMethod: z.enum(["upi", "netbanking", "card", "wallet", "paylater"]),
  upiDetails: z.object({
    vpa: z.string().optional(),
    provider: z.string().optional(),
    transactionId: z.string().optional(),
  }).optional(),
  cardDetails: z.object({
    last4: z.string().optional(),
    brand: z.string().optional(),
    type: z.string().optional(),
    network: z.string().optional(),
  }).optional(),
})

// Export Model
export const Payment = mongoose.models?.Payment
  ? (mongoose.models.Payment as mongoose.Model<IPayment>)
  : mongoose.model<IPayment>("Payment", PaymentSchema)

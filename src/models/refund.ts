import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IRefund extends Document {
  razorpayOrderId: mongoose.Types.ObjectId
  razorpayPaymentId: mongoose.Types.ObjectId
  refundId: string
  customerId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  amount: number
  refundTime: Date
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const RefundSchema = new Schema<IRefund>(
  {
    razorpayOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: [true, "Razorpay order ID is required"],
    },
    razorpayPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: [true, "Razorpay payment ID is required"],
    },
    refundId: {
      type: String,
      required: [true, "Refund ID is required"],
      unique: true,
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
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    refundTime: {
      type: Date,
      required: [true, "Refund time is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const RefundZodSchema = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  refundId: z.string().min(1, "Refund ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  amount: z.number().min(0, "Amount must be positive"),
  refundTime: z.date().default(() => new Date()),
})

export const RefundUpdateZodSchema = RefundZodSchema.partial()

// Export Model
export const Refund = mongoose.models.Refund || mongoose.model<IRefund>("Refund", RefundSchema)
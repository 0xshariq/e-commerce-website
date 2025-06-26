import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  amount: number
  razorpayOrderId: string
  razorpayPaymentId: string
  paymentTime: Date
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
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay order ID is required"],
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      required: [true, "Razorpay payment ID is required"],
      unique: true,
    },
    paymentTime: {
      type: Date,
      required: [true, "Payment time is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const PaymentZodSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  amount: z.number().min(0, "Amount must be positive"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  paymentTime: z.date().default(() => new Date()),
})

export const PaymentUpdateZodSchema = PaymentZodSchema.partial()

// Export Model
export const Payment = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)

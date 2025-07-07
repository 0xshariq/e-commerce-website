import mongoose, {  type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IRefund extends Document {
  orderId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  requestRefundId: mongoose.Types.ObjectId
  refundAmount: number
  refundReason: string
  refundStatus: "initiated" | "processing" | "completed" | "failed"
  razorpayPaymentId: string
  razorpayRefundId?: string
  refundMethod: "original_payment" | "bank_transfer" | "wallet"
  processedBy?: mongoose.Types.ObjectId
  refundNotes?: string
  refundDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const refundSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    requestRefundId: { type: mongoose.Schema.Types.ObjectId, ref: "RequestRefund", required: true },
    refundAmount: { type: Number, required: true },
    refundReason: { type: String, required: true },
    refundStatus: {
      type: String,
      enum: ["initiated", "processing", "completed", "failed"],
      default: "initiated",
    },
    razorpayPaymentId: { type: String, required: true },
    razorpayRefundId: { type: String },
    refundMethod: {
      type: String,
      enum: ["original_payment", "bank_transfer", "wallet"],
      default: "original_payment",
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    refundNotes: { type: String },
    refundDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

export const refundZodSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  vendorId: z.string(),
  requestRefundId: z.string(),
  refundAmount: z.number().min(0),
  refundReason: z.string(),
  refundStatus: z.enum(["initiated", "processing", "completed", "failed"]).default("initiated"),
  razorpayPaymentId: z.string(),
  razorpayRefundId: z.string().optional(),
  refundMethod: z.enum(["original_payment", "bank_transfer", "wallet"]).default("original_payment"),
  processedBy: z.string().optional(),
  refundNotes: z.string().optional(),
  refundDate: z.date().optional(),
  completedAt: z.date().optional(),
})

export type RefundType = z.infer<typeof refundZodSchema>

export const Refund = mongoose.models?.Refund
  ? (mongoose.models.Refund as mongoose.Model<IRefund>)
  : mongoose.model<IRefund>("Refund", refundSchema)

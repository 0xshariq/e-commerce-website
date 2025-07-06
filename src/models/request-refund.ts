import mongoose from "mongoose"
import { z } from "zod"

const requestRefundSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    notes: { type: String },
    attachments: [{ type: String }],
    refundReasonCategory: {
      type: String,
      enum: ["duplicate", "not_as_described", "defective", "wrong_item", "other"],
      default: "other",
    },
    requestStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    processedAt: { type: Date },
    adminNotes: { type: String },
  },
  { timestamps: true },
)

export const RequestRefundZodSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  vendorId: z.string(),
  amount: z.number().min(0),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  refundReasonCategory: z.enum(["duplicate", "not_as_described", "defective", "wrong_item", "other"]).optional(),
  requestStatus: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  processedBy: z.string().optional(),
  processedAt: z.date().optional(),
  adminNotes: z.string().optional(),
})

export type RequestRefundType = z.infer<typeof RequestRefundZodSchema>

export const RequestRefund = mongoose.models?.RequestRefund || mongoose.model("RequestRefund", requestRefundSchema)

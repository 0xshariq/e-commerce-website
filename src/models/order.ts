import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IOrder extends Document {
  quantity: number
  productName: string
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  productPrice: number
  vendorId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const OrderSchema = new Schema<IOrder>(
  {
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price must be positive"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const OrderZodSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  productName: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .trim(),
  orderStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending"),
  productPrice: z.number().min(0, "Product price must be positive"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
})

export const OrderUpdateZodSchema = OrderZodSchema.partial()

// Export Model
export const Order = mongoose.models?.Order
  ? (mongoose.models.Order as mongoose.Model<IOrder>)
  : mongoose.model<IOrder>("Order", OrderSchema);

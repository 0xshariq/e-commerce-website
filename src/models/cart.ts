import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface ICart extends Document {
  customerId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  quantity: number
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const CartSchema = new Schema<ICart>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate cart items
CartSchema.index({ customerId: 1, productId: 1 }, { unique: true })

// Zod Schema
export const CartZodSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

export const CartUpdateZodSchema = CartZodSchema.partial()

// Export Model
export const Cart = mongoose.models?.Cart
  ? (mongoose.models.Cart as mongoose.Model<ICart>)
  : mongoose.model<ICart>("Cart", CartSchema);

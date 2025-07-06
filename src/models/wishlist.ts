import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IWishlist extends Document {
  customerId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const WishlistSchema = new Schema<IWishlist>(
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
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate wishlist items
WishlistSchema.index({ customerId: 1, productId: 1 }, { unique: true })

// Zod Schema
export const WishlistZodSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  productId: z.string().min(1, "Product ID is required"),
})

export const WishlistUpdateZodSchema = WishlistZodSchema.partial()

// Export Model
export const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema)

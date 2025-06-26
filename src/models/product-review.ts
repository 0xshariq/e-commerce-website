import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IProductReview extends Document {
  productId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const ProductReviewSchema = new Schema<IProductReview>(
  {
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
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate reviews from same customer for same product
ProductReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true })

// Zod Schema
export const ProductReviewZodSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters")
    .trim(),
})

export const ProductReviewUpdateZodSchema = ProductReviewZodSchema.partial()

// Export Model
export const ProductReview =
  mongoose.models.ProductReview || mongoose.model<IProductReview>("ProductReview", ProductReviewSchema)

import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IProduct extends Document {
  productName: string
  productPrice: number
  imageUrl: string
  vendorId: mongoose.Types.ObjectId
  category: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const ProductSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price must be positive"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i, "Please enter a valid image URL"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
ProductSchema.index({ productName: "text", category: 1 })

// Zod Schema
export const ProductZodSchema = z.object({
  productName: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .trim(),
  productPrice: z.number().min(0, "Product price must be positive"),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .regex(/\.(jpg|jpeg|png|webp|gif)$/i, "Image must be a valid image file"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  category: z.string().min(1, "Category is required"),
})

export const ProductUpdateZodSchema = ProductZodSchema.partial()

// Export Model
export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

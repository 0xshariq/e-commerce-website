import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IAddress extends Document {
  customerId: mongoose.Types.ObjectId
  addressLine1: string
  addressLine2?: string
  city: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const AddressSchema = new Schema<IAddress>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
      minlength: [5, "Address line 1 must be at least 5 characters"],
      maxlength: [100, "Address line 1 cannot exceed 100 characters"],
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [100, "Address line 2 cannot exceed 100 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters"],
      maxlength: [50, "City cannot exceed 50 characters"],
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      match: [/^\d{5,10}$/, "Please enter a valid zip code"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      minlength: [2, "Country must be at least 2 characters"],
      maxlength: [50, "Country cannot exceed 50 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const AddressZodSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(100, "Address line 1 cannot exceed 100 characters")
    .trim(),
  addressLine2: z.string().max(100, "Address line 2 cannot exceed 100 characters").trim().optional(),
  city: z.string().min(2, "City must be at least 2 characters").max(50, "City cannot exceed 50 characters").trim(),
  zipCode: z.string().regex(/^\d{5,10}$/, "Please enter a valid zip code"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country cannot exceed 50 characters")
    .trim(),
  isDefault: z.boolean().default(false),
})

export const AddressUpdateZodSchema = AddressZodSchema.partial()

// Export Model
export const Address = mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema)

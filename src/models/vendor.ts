import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IVendor extends Document {
  name: string
  email: string
  password: string
  mobileNo: string
  shopAddress: string
  availableProducts: string[]
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const VendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    shopAddress: {
      type: String,
      trim: true,
      minlength: [10, "Shop address must be at least 10 characters"],
      maxlength: [200, "Shop address cannot exceed 200 characters"],
    },
    availableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const VendorZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  mobileNo: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number"),
  shopAddress: z
    .string()
    .min(10, "Shop address must be at least 10 characters")
    .max(200, "Shop address cannot exceed 200 characters")
    .trim(),
  availableProducts: z.array(z.string()).default([]),
})

export const VendorUpdateZodSchema = VendorZodSchema.partial()

// Export Model
export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema)

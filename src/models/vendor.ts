import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IVendor extends Document {
  name: string
  email: string
  password: string
  mobileNo: string
  shopAddress: string
  upiId: string
  availableProducts: string[]
  isApproved: boolean
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
      required: [true, "Shop address is required"],
      minlength: [10, "Shop address must be at least 10 characters"],
    },
    upiId: {
      type: String,
      required: [true, "UPI ID is required"],
      match: [/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID"],
    },
    availableProducts: [
      {
        type: String,
        ref: "Product",
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
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
  shopAddress: z.string().min(10, "Shop address must be at least 10 characters"),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID"),
  availableProducts: z.array(z.string()).default([]),
  isApproved: z.boolean().default(false),
})

export const VendorUpdateZodSchema = VendorZodSchema.partial()

// Export Model
export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema)

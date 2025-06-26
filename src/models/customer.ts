import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface ICustomer extends Document {
  name: string
  email: string
  password: string
  productsPurchased: string[]
  mobileNo: string
  address: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const CustomerSchema = new Schema<ICustomer>(
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
    productsPurchased: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const CustomerZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  productsPurchased: z.array(z.string()).default([]),
  mobileNo: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number"),
  address: z.string().optional(),
})

export const CustomerUpdateZodSchema = CustomerZodSchema.partial()

// Export Model
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema)

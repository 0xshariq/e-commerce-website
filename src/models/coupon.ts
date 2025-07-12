import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface ICoupon extends Document {
  code: string
  discountType: "percentage" | "amount"
  discountValue: number // percentage (1-100) or fixed amount
  minimumOrderAmount?: number // minimum order value to apply coupon
  maximumDiscountAmount?: number // max discount cap for percentage type
  expiryDate: Date
  isActive: boolean
  usageLimit: number // total times coupon can be used
  usedCount: number // times coupon has been used
  userLimit: number // max times per user
  description: string
  couponType: "normal" | "special" // Only special coupons have userLimit enforcement
  createdAt: Date
  updatedAt: Date
  productId: mongoose.Types.ObjectId // Reference to Product model
  vendorId: mongoose.Types.ObjectId // Reference to Vendor model
}

// Mongoose Schema
const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [4, "Coupon code must be at least 4 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
      match: [/^[A-Z0-9]+$/, "Coupon code can only contain capital letters and numbers"],
    },
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "amount"],
        message: "Discount type must be either 'percentage' or 'amount'",
      },
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0.01, "Discount value must be greater than 0"],
    },
    minimumOrderAmount: {
      type: Number,
      min: [0, "Minimum order amount must be positive"],
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      min: [0, "Maximum discount amount must be positive"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      required: [true, "Usage limit is required"],
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    userLimit: {
      type: Number,
      required: function(this: ICoupon) {
        // Only required for special coupons
        return this.couponType === 'special';
      },
      min: [1, "User limit must be at least 1"],
      default: 1,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    couponType: {
      type: String,
      enum: {
        values: ["normal", "special"],
        message: "Coupon type must be either 'normal' or 'special'",
      },
      required: [true, "Coupon type is required"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save validation
CouponSchema.pre("save", function (next) {
  // Validate percentage discount
  if (this.discountType === "percentage") {
    if (this.discountValue > 100) {
      return next(new Error("Percentage discount cannot exceed 100%"))
    }
    if (this.discountValue < 1) {
      return next(new Error("Percentage discount must be at least 1%"))
    }
  }

  // Validate amount discount
  if (this.discountType === "amount") {
    if (this.minimumOrderAmount && this.discountValue >= this.minimumOrderAmount) {
      return next(new Error("Discount amount cannot be greater than or equal to minimum order amount"))
    }
  }

  // Validate expiry date
  if (this.expiryDate <= new Date()) {
    return next(new Error("Expiry date must be in the future"))
  }

  // Validate usage limits
  if (this.usedCount > this.usageLimit) {
    return next(new Error("Used count cannot exceed usage limit"))
  }

  next()
})

// Instance method to check if coupon is valid
CouponSchema.methods.isValidCoupon = function (): boolean {
  return this.isActive && this.expiryDate > new Date() && this.usedCount < this.usageLimit
}

// Instance method to calculate discount amount
CouponSchema.methods.calculateDiscount = function (orderAmount: number): number {
  if (!this.isValidCoupon()) {
    return 0
  }

  if (orderAmount < (this.minimumOrderAmount || 0)) {
    return 0
  }

  let discountAmount = 0

  if (this.discountType === "percentage") {
    discountAmount = (orderAmount * this.discountValue) / 100

    // Apply maximum discount cap if set
    if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
      discountAmount = this.maximumDiscountAmount
    }
  } else if (this.discountType === "amount") {
    discountAmount = this.discountValue

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount
    }
  }

  return Math.round(discountAmount * 100) / 100 // Round to 2 decimal places
}

// Zod Schema
const CouponZodObject = z.object({
  code: z
    .string()
    .min(4, "Coupon code must be at least 4 characters")
    .max(20, "Coupon code cannot exceed 20 characters")
    .regex(/^[A-Z0-9]+$/, "Coupon code can only contain capital letters and numbers")
    .trim()
    .toUpperCase(),
  discountType: z.enum(["percentage", "amount"], {
    errorMap: () => ({ message: "Discount type must be either 'percentage' or 'amount'" }),
  }),
  discountValue: z.number().min(0.01, "Discount value must be greater than 0"),
  minimumOrderAmount: z.number().min(0, "Minimum order amount must be positive").optional(),
  maximumDiscountAmount: z.number().min(0, "Maximum discount amount must be positive").optional(),
  expiryDate: z.date().refine((date) => date > new Date(), {
    message: "Expiry date must be in the future",
  }),
  isActive: z.boolean().default(true),
  usageLimit: z.number().min(1, "Usage limit must be at least 1"),
  usedCount: z.number().min(0, "Used count cannot be negative").default(0),
  userLimit: z.number().min(1, "User limit must be at least 1").default(1).optional(),
  description: z.string().max(200, "Description cannot exceed 200 characters").trim(),
  couponType: z.enum(["normal", "special"], {
    errorMap: () => ({ message: "Coupon type must be either 'normal' or 'special'" }),
  }).default("normal"),
})

export const CouponZodSchema = CouponZodObject
  .refine(
    (data) => {
      // Validate percentage discount range
      if (data.discountType === "percentage") {
        return data.discountValue >= 1 && data.discountValue <= 100
      }
      return true
    },
    {
      message: "Percentage discount must be between 1% and 100%",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // Validate amount discount vs minimum order
      if (data.discountType === "amount" && data.minimumOrderAmount) {
        return data.discountValue < data.minimumOrderAmount
      }
      return true
    },
    {
      message: "Discount amount cannot be greater than or equal to minimum order amount",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // Validate used count vs usage limit
      return data.usedCount <= data.usageLimit
    },
    {
      message: "Used count cannot exceed usage limit",
      path: ["usedCount"],
    },
  )

export const CouponUpdateZodSchema = CouponZodObject.partial()

// Coupon Application Schema (for frontend use)
export const CouponApplicationZodSchema = z.object({
  code: z
    .string()
    .min(4, "Coupon code must be at least 4 characters")
    .regex(/^[A-Z0-9]+$/, "Invalid coupon code format")
    .trim()
    .toUpperCase(),
  orderAmount: z.number().min(0.01, "Order amount must be greater than 0"),
  customerId: z.string().min(1, "Customer ID is required"),
  categoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
})

// Export Model
export const Coupon = mongoose.models?.Coupon
  ? (mongoose.models.Coupon as mongoose.Model<ICoupon>)
  : mongoose.model<ICoupon>("Coupon", CouponSchema);

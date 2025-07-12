import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IProductSale extends Document {
  saleId: string
  productId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  saleTitle: string
  saleDescription?: string
  discountType: "percentage" | "amount"
  discountValue: number
  originalPrice: number
  salePrice: number
  saleStartingDate: Date
  saleEndingDate: Date
  isActive: boolean
  maxQuantity?: number // Maximum quantity available on sale
  soldQuantity: number // Quantity already sold
  saleType: "flash" | "seasonal" | "clearance" | "special"
  minOrderQuantity?: number
  maxOrderQuantity?: number
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const ProductSaleSchema = new Schema<IProductSale>(
  {
    saleId: {
      type: String,
      required: [true, "Sale ID is required"],
      unique: true,
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
    saleTitle: {
      type: String,
      required: [true, "Sale title is required"],
      trim: true,
      maxlength: [100, "Sale title cannot exceed 100 characters"],
    },
    saleDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Sale description cannot exceed 500 characters"],
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
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0.01, "Original price must be greater than 0"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0.01, "Sale price must be greater than 0"],
    },
    saleStartingDate: {
      type: Date,
      required: [true, "Sale starting date is required"],
    },
    saleEndingDate: {
      type: Date,
      required: [true, "Sale ending date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxQuantity: {
      type: Number,
      min: [1, "Max quantity must be at least 1"],
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: [0, "Sold quantity cannot be negative"],
    },
    saleType: {
      type: String,
      enum: {
        values: ["flash", "seasonal", "clearance", "special"],
        message: "Sale type must be one of: flash, seasonal, clearance, special",
      },
      required: [true, "Sale type is required"],
      default: "special",
    },
    minOrderQuantity: {
      type: Number,
      min: [1, "Minimum order quantity must be at least 1"],
      default: 1,
    },
    maxOrderQuantity: {
      type: Number,
      min: [1, "Maximum order quantity must be at least 1"],
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save validation
ProductSaleSchema.pre("save", function (next) {
  // Validate percentage discount
  if (this.discountType === "percentage") {
    if (this.discountValue > 100) {
      return next(new Error("Percentage discount cannot exceed 100%"))
    }
    if (this.discountValue < 1) {
      return next(new Error("Percentage discount must be at least 1%"))
    }
  }

  // Validate sale price calculation
  let calculatedSalePrice = this.originalPrice;
  if (this.discountType === "percentage") {
    calculatedSalePrice = this.originalPrice - (this.originalPrice * this.discountValue / 100);
  } else {
    calculatedSalePrice = this.originalPrice - this.discountValue;
  }

  // Update sale price if not manually set
  if (Math.abs(this.salePrice - calculatedSalePrice) > 0.01) {
    this.salePrice = Math.round(calculatedSalePrice * 100) / 100;
  }

  // Validate sale dates
  if (this.saleEndingDate <= this.saleStartingDate) {
    return next(new Error("Sale ending date must be after starting date"))
  }

  // Validate quantities
  if (this.maxOrderQuantity && this.minOrderQuantity && this.maxOrderQuantity < this.minOrderQuantity) {
    return next(new Error("Maximum order quantity cannot be less than minimum order quantity"))
  }

  if (this.maxQuantity && this.soldQuantity > this.maxQuantity) {
    return next(new Error("Sold quantity cannot exceed maximum quantity"))
  }

  next()
})

// Instance methods
ProductSaleSchema.methods.isActiveSale = function (): boolean {
  const now = new Date();
  return this.isActive && 
         this.saleStartingDate <= now && 
         this.saleEndingDate > now &&
         (!this.maxQuantity || this.soldQuantity < this.maxQuantity);
}

ProductSaleSchema.methods.getRemainingQuantity = function (): number | null {
  if (!this.maxQuantity) return null;
  return Math.max(0, this.maxQuantity - this.soldQuantity);
}

ProductSaleSchema.methods.calculateSalePrice = function (originalPrice: number): number {
  if (this.discountType === "percentage") {
    return originalPrice - (originalPrice * this.discountValue / 100);
  } else {
    return originalPrice - this.discountValue;
  }
}

// Zod Schema
export const ProductSaleZodSchema = z.object({
  saleId: z.string().min(1, "Sale ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  saleTitle: z.string().min(1, "Sale title is required").max(100, "Sale title cannot exceed 100 characters").trim(),
  saleDescription: z.string().max(500, "Sale description cannot exceed 500 characters").trim().optional(),
  discountType: z.enum(["percentage", "amount"], {
    errorMap: () => ({ message: "Discount type must be either 'percentage' or 'amount'" }),
  }),
  discountValue: z.number().min(0.01, "Discount value must be greater than 0"),
  originalPrice: z.number().min(0.01, "Original price must be greater than 0"),
  salePrice: z.number().min(0.01, "Sale price must be greater than 0"),
  saleStartingDate: z.date(),
  saleEndingDate: z.date(),
  isActive: z.boolean().default(true),
  maxQuantity: z.number().min(1, "Max quantity must be at least 1").optional(),
  soldQuantity: z.number().min(0, "Sold quantity cannot be negative").default(0),
  saleType: z.enum(["flash", "seasonal", "clearance", "special"], {
    errorMap: () => ({ message: "Sale type must be one of: flash, seasonal, clearance, special" }),
  }).default("special"),
  minOrderQuantity: z.number().min(1, "Minimum order quantity must be at least 1").default(1).optional(),
  maxOrderQuantity: z.number().min(1, "Maximum order quantity must be at least 1").optional(),
})
  .refine(
    (data) => {
      // Validate percentage discount range
      if (data.discountType === "percentage") {
        return data.discountValue >= 1 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1% and 100%",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      return data.saleEndingDate > data.saleStartingDate;
    },
    {
      message: "Sale ending date must be after starting date",
      path: ["saleEndingDate"],
    },
  )
  .refine(
    (data) => {
      if (data.maxOrderQuantity && data.minOrderQuantity) {
        return data.maxOrderQuantity >= data.minOrderQuantity;
      }
      return true;
    },
    {
      message: "Maximum order quantity cannot be less than minimum order quantity",
      path: ["maxOrderQuantity"],
    },
  );

export const ProductSaleUpdateZodSchema = ProductSaleZodSchema.partial();

// Export Model
export const ProductSale = mongoose.models?.ProductSale
  ? (mongoose.models.ProductSale as mongoose.Model<IProductSale>)
  : mongoose.model<IProductSale>("ProductSale", ProductSaleSchema);

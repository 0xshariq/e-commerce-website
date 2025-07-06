import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IProductSale extends Document {
  saleId: string
  saleStartingDate: Date
  vendorId: mongoose.Types.ObjectId
  saleEndingDate: Date
  amount: number
  productId: mongoose.Types.ObjectId
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
    saleStartingDate: {
      type: Date,
      required: [true, "Sale starting date is required"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    saleEndingDate: {
      type: Date,
      required: [true, "Sale ending date is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
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

// Pre-save validation to ensure ending date is after starting date
ProductSaleSchema.pre("save", function (next) {
  if (this.saleEndingDate <= this.saleStartingDate) {
    next(new Error("Sale ending date must be after starting date"))
  } else {
    next()
  }
})

// Zod Schema
const ProductSaleBaseZodSchema = z.object({
  saleId: z.string().min(1, "Sale ID is required"),
  saleStartingDate: z.date(),
  vendorId: z.string().min(1, "Vendor ID is required"),
  saleEndingDate: z.date(),
  amount: z.number().min(0, "Amount must be positive"),
  productId: z.string().min(1, "Product ID is required"),
})

export const ProductSaleZodSchema = ProductSaleBaseZodSchema.refine(
  (data) => data.saleEndingDate > data.saleStartingDate,
  {
    message: "Sale ending date must be after starting date",
    path: ["saleEndingDate"],
  }
)

export const ProductSaleUpdateZodSchema = ProductSaleBaseZodSchema.partial().refine(
  (data) =>
    (data.saleStartingDate === undefined ||
      data.saleEndingDate === undefined ||
      data.saleEndingDate > data.saleStartingDate),
  {
    message: "Sale ending date must be after starting date",
    path: ["saleEndingDate"],
  }
)

// Export Model
export const ProductSale = mongoose.models.ProductSale || mongoose.model<IProductSale>("ProductSale", ProductSaleSchema)

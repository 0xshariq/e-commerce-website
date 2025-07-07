import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  stockQuantity: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const InventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      unique: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
    },
    lastUpdated: {
      type: Date,
      required: [true, "Last updated date is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save middleware to update lastUpdated
InventorySchema.pre("save", function (next) {
  this.lastUpdated = new Date()
  next()
})

// Zod Schema
export const InventoryZodSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  lastUpdated: z.date().default(() => new Date()),
})

export const InventoryUpdateZodSchema = InventoryZodSchema.partial()

// Export Model
export const Inventory = mongoose.models?.Inventory
  ? (mongoose.models.Inventory as mongoose.Model<IInventory>)
  : mongoose.model<IInventory>("Inventory", InventorySchema)

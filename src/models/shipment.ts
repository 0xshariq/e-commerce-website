import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IShipment extends Document {
  productId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  arriveAt: Date
  shippedAt: Date
  status: "pending" | "shipped" | "in_transit" | "delivered" | "returned"
  createdAt: Date
  updatedAt: Date
}

// Mongoose Schema
const ShipmentSchema = new Schema<IShipment>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer ID is required"],
    },
    arriveAt: {
      type: Date,
      required: [true, "Arrival date is required"],
    },
    shippedAt: {
      type: Date,
      required: [true, "Shipped date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "in_transit", "delivered", "returned"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

// Zod Schema
export const ShipmentZodSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  arriveAt: z.date(),
  shippedAt: z.date(),
  status: z.enum(["pending", "shipped", "in_transit", "delivered", "returned"]).default("pending"),
})

export const ShipmentUpdateZodSchema = ShipmentZodSchema.partial()

// Export Model
export const Shipment = mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema)

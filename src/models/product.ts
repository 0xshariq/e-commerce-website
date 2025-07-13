import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// TypeScript Interface
export interface IProduct extends Document {
  productName: string
  productDescription?: string
  productPrice: number
  originalPrice?: number
  discountPercentage?: number
  imageUrl: string
  images?: string[]
  vendorId: mongoose.Types.ObjectId
  category: string
  subcategory?: string
  brand?: string
  sku?: string
  stockQuantity: number
  minStockLevel?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags?: string[]
  specifications?: Record<string, any>
  status: 'active' | 'inactive' | 'draft' | 'out-of-stock'
  isPublished: boolean
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  rating?: number
  reviewCount?: number
  totalSales?: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

// Available product categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Fashion',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Automotive',
  'Food & Beverages',
  'Jewelry & Accessories',
  'Arts & Crafts',
  'Baby & Kids',
  'Pet Supplies',
  'Office Supplies',
  'Travel & Luggage',
  'Musical Instruments',
  'Industrial & Scientific',
  'Other'
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

// Mongoose Schema
const ProductSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    productDescription: {
      type: String,
      trim: true,
      maxlength: [2000, "Product description cannot exceed 2000 characters"],
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price must be positive"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price must be positive"],
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage must be positive"],
      max: [100, "Discount percentage cannot exceed 100"],
    },
    imageUrl: {
      type: String,
      required: [true, "Product image is required"],
    },
    images: [{
      type: String,
    }],
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: PRODUCT_CATEGORIES,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      min: [0, "Minimum stock level cannot be negative"],
      default: 5,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    tags: [{
      type: String,
      trim: true,
    }],
    specifications: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft', 'out-of-stock'],
      default: 'draft',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    seoKeywords: [{
      type: String,
      trim: true,
    }],
    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: [0, "Review count cannot be negative"],
      default: 0,
    },
    totalSales: {
      type: Number,
      min: [0, "Total sales cannot be negative"],
      default: 0,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better search performance
ProductSchema.index({ productName: "text", productDescription: "text", category: 1 })
ProductSchema.index({ vendorId: 1, status: 1 })
ProductSchema.index({ category: 1, subcategory: 1 })
ProductSchema.index({ status: 1, isPublished: 1 })
ProductSchema.index({ isFeatured: 1, status: 1 })
// Note: sku index is already defined in the schema with unique: true, sparse: true

// Virtual for calculating discounted price
ProductSchema.virtual('discountedPrice').get(function() {
  if (this.originalPrice && this.discountPercentage) {
    return this.originalPrice * (1 - this.discountPercentage / 100)
  }
  return this.productPrice
})

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.stockQuantity > 0 && this.status !== 'out-of-stock'
})

// Virtual for checking if stock is low
ProductSchema.virtual('lowStock').get(function() {
  return this.stockQuantity <= (this.minStockLevel || 5) && this.stockQuantity > 0
})

// Pre-save middleware to update status based on stock
ProductSchema.pre('save', function(next) {
  if (this.stockQuantity === 0) {
    this.status = 'out-of-stock'
  } else if (this.status === 'out-of-stock' && this.stockQuantity > 0) {
    this.status = 'active'
  }
  
  // Generate SKU if not provided
  if (!this.sku && this.isNew) {
    this.sku = `${this.category.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }
  
  next()
})

// Zod Schema for validation
export const ProductZodSchema = z.object({
  productName: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name cannot exceed 200 characters")
    .trim(),
  productDescription: z
    .string()
    .max(2000, "Product description cannot exceed 2000 characters")
    .optional(),
  productPrice: z.number().min(0, "Product price must be positive"),
  originalPrice: z.number().min(0, "Original price must be positive").optional(),
  discountPercentage: z.number().min(0).max(100, "Discount percentage must be between 0 and 100").optional(),
  imageUrl: z.string().min(1, "Product image is required"),
  images: z.array(z.string()).optional(),
  vendorId: z.string().min(1, "Vendor ID is required"),
  category: z.enum(PRODUCT_CATEGORIES),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  minStockLevel: z.number().min(0, "Minimum stock level cannot be negative").optional(),
  weight: z.number().min(0, "Weight cannot be negative").optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'draft', 'out-of-stock']).default('draft'),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60, "SEO title cannot exceed 60 characters").optional(),
  seoDescription: z.string().max(160, "SEO description cannot exceed 160 characters").optional(),
  seoKeywords: z.array(z.string()).optional(),
})

export const ProductUpdateZodSchema = ProductZodSchema.partial()

// Export Model
export const Product = mongoose.models?.Product
  ? (mongoose.models.Product as mongoose.Model<IProduct>)
  : mongoose.model<IProduct>("Product", ProductSchema)

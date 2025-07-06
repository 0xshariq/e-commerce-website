import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// Business Information interface
export interface IBusinessInfo {
  businessName: string
  businessType: 'individual' | 'partnership' | 'private_limited' | 'public_limited' | 'llp'
  businessCategory: string
  gstNumber?: string
  panNumber: string
  businessRegistrationNumber?: string
  businessEmail?: string
  businessPhone?: string
  yearEstablished?: number
}

// Address interface for vendors
export interface IVendorAddress {
  type: 'registered' | 'pickup' | 'return' | 'warehouse'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  landmark?: string
  isDefault: boolean
}

// Performance metrics interface
export interface IPerformanceMetrics {
  totalSales: number
  totalOrders: number
  averageRating: number
  totalReviews: number
  responseTime: number // in hours
  returnRate: number // percentage
  cancellationRate: number // percentage
  onTimeDeliveryRate: number // percentage
}

// TypeScript Interface
export interface IVendor extends Document {
  // Basic Information
  firstName: string
  lastName: string
  email: string
  password: string
  mobileNo: string
  alternatePhone?: string
  profileImage?: string
  
  // Business Information
  businessInfo: IBusinessInfo
  
  // Addresses
  addresses: IVendorAddress[]
  
  // Financial Information - Simplified for Razorpay
  upiId: string // Required for payments via Razorpay
  
  // Account Status & Verification
  isApproved: boolean
  isEmailVerified: boolean
  isMobileVerified: boolean
  emailVerificationToken?: string
  emailVerificationCode?: string
  emailVerificationExpiry?: Date
  mobileVerificationCode?: string
  mobileVerificationExpiry?: Date
  isBusinessVerified: boolean
  isGSTVerified: boolean
  accountStatus: 'active' | 'suspended' | 'under_review' | 'rejected'
  
  // Products & Inventory
  products: string[] // Product IDs
  categories: string[] // Categories they sell in
  totalProducts: number
  activeProducts: number
  
  // Orders & Sales
  orders: string[] // Order IDs
  
  // Performance & Analytics
  performanceMetrics: IPerformanceMetrics
  
  // Settings & Preferences
  settings: {
    autoAcceptOrders: boolean
    maxOrdersPerDay: number
    workingHours: {
      start: string
      end: string
      workingDays: string[]
    }
    notifications: {
      orderAlerts: boolean
      paymentAlerts: boolean
      inventoryAlerts: boolean
      promotionalEmails: boolean
    }
  }
  
  // KYC & Documents
  documents: Array<{
    type: 'pan' | 'gst' | 'business_license' | 'id_proof' | 'address_proof'
    documentUrl: string
    status: 'pending' | 'approved' | 'rejected'
    uploadedAt: Date
    remarks?: string
  }>
  
  // Timestamps
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Business Info Schema
const BusinessInfoSchema = new Schema<IBusinessInfo>({
  businessName: {
    type: String,
    required: [true, "Business name is required"],
    trim: true,
    minlength: [2, "Business name must be at least 2 characters"],
    maxlength: [100, "Business name cannot exceed 100 characters"]
  },
  businessType: {
    type: String,
    enum: ['individual', 'partnership', 'private_limited', 'public_limited', 'llp'],
    required: [true, "Business type is required"]
  },
  businessCategory: {
    type: String,
    required: [true, "Business category is required"],
    trim: true
  },
  gstNumber: {
    type: String,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid GST number"],
    sparse: true,
    uppercase: true
  },
  panNumber: {
    type: String,
    required: [true, "PAN number is required"],
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number"],
    uppercase: true
  },
  businessRegistrationNumber: {
    type: String,
    trim: true
  },
  businessEmail: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid business email"]
  },
  businessPhone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid business phone number"]
  },
  yearEstablished: {
    type: Number,
    min: [1800, "Year established cannot be before 1800"],
    max: [new Date().getFullYear(), "Year established cannot be in the future"]
  }
}, { _id: false })

// Vendor Address Schema
const VendorAddressSchema = new Schema<IVendorAddress>({
  type: {
    type: String,
    enum: ['registered', 'pickup', 'return', 'warehouse'],
    required: true
  },
  addressLine1: {
    type: String,
    required: [true, "Address line 1 is required"],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
    match: [/^\d{6}$/, "Please enter a valid 6-digit postal code"]
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true })

// Performance Metrics Schema
const PerformanceMetricsSchema = new Schema<IPerformanceMetrics>({
  totalSales: { type: Number, default: 0, min: 0 },
  totalOrders: { type: Number, default: 0, min: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0, min: 0 },
  responseTime: { type: Number, default: 24, min: 0 },
  returnRate: { type: Number, default: 0, min: 0, max: 100 },
  cancellationRate: { type: Number, default: 0, min: 0, max: 100 },
  onTimeDeliveryRate: { type: Number, default: 100, min: 0, max: 100 }
}, { _id: false })

// Documents Schema
const DocumentSchema = new Schema({
  type: {
    type: String,
    enum: ['pan', 'gst', 'business_license', 'id_proof', 'address_proof'],
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String,
    trim: true
  }
}, { _id: true })

// Settings Schema
const SettingsSchema = new Schema({
  autoAcceptOrders: { type: Boolean, default: true },
  maxOrdersPerDay: { type: Number, default: 100, min: 1 },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    workingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }]
  },
  notifications: {
    orderAlerts: { type: Boolean, default: true },
    paymentAlerts: { type: Boolean, default: true },
    inventoryAlerts: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: false }
  }
}, { _id: false })

// Mongoose Schema
const VendorSchema = new Schema<IVendor>(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name must be at least 1 character"],
      maxlength: [30, "Last name cannot exceed 30 characters"],
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
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    alternatePhone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid alternate phone number"],
    },
    profileImage: {
      type: String,
      default: ''
    },

    // Business Information
    businessInfo: {
      type: BusinessInfoSchema,
      required: true
    },

    // Addresses
    addresses: [VendorAddressSchema],

    // Financial Information - Simplified for Razorpay
    upiId: {
      type: String,
      required: [true, "UPI ID is required for payments"],
      match: [/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID"],
    },

    // Account Status & Verification
    isApproved: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isMobileVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationCode: {
      type: String,
      default: null
    },
    emailVerificationExpiry: {
      type: Date,
      default: null
    },
    mobileVerificationCode: {
      type: String,
      default: null
    },
    mobileVerificationExpiry: {
      type: Date,
      default: null
    },
    isBusinessVerified: {
      type: Boolean,
      default: false
    },
    isGSTVerified: {
      type: Boolean,
      default: false
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'under_review', 'rejected'],
      default: 'under_review'
    },

    // Products & Inventory
    products: [{
      type: String,
      ref: 'Product'
    }],
    categories: [{
      type: String,
      ref: 'Category'
    }],
    totalProducts: {
      type: Number,
      default: 0,
      min: 0
    },
    activeProducts: {
      type: Number,
      default: 0,
      min: 0
    },

    // Orders & Sales
    orders: [{
      type: String,
      ref: 'Order'
    }],

    // Performance & Analytics
    performanceMetrics: {
      type: PerformanceMetricsSchema,
      default: () => ({})
    },

    // Settings & Preferences
    settings: SettingsSchema,

    // KYC & Documents
    documents: [DocumentSchema],

    // Timestamps
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
  },
)

// Zod Schemas
export const BusinessInfoZodSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name cannot exceed 100 characters").trim(),
  businessType: z.enum(['individual', 'partnership', 'private_limited', 'public_limited', 'llp']),
  businessCategory: z.string().min(2, "Business category is required").trim(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid GST number").optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number"),
  businessRegistrationNumber: z.string().optional(),
  businessEmail: z.string().email("Invalid business email").optional(),
  businessPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid business phone number").optional(),
  yearEstablished: z.number().min(1800).max(new Date().getFullYear()).optional()
})

export const VendorAddressZodSchema = z.object({
  type: z.enum(['registered', 'pickup', 'return', 'warehouse']),
  addressLine1: z.string().min(5, "Address line 1 must be at least 5 characters").trim(),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters").trim(),
  state: z.string().min(2, "State must be at least 2 characters").trim(),
  postalCode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit postal code"),
  country: z.string().default('India'),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false)
})

export const VendorZodSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(30, "First name cannot exceed 30 characters").trim(),
  lastName: z.string().min(1, "Last name must be at least 1 character").max(30, "Last name cannot exceed 30 characters").trim(),
  email: z.string().email("Invalid email address").regex(
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
    "Please enter a valid email",
  ).toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  mobileNo: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number"),
  alternatePhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid alternate phone number").optional(),
  businessInfo: BusinessInfoZodSchema,
  addresses: z.array(VendorAddressZodSchema).min(1, "At least one address is required"),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID")
})

export const VendorUpdateZodSchema = VendorZodSchema.partial()

// Export Model
export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema)

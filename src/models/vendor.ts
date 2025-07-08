import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// Address interface for embedded addresses
export interface IAddress {
  type: 'registered' | 'pickup' | 'warehouse' | 'other'
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

// Business Information interface
export interface IBusinessInfo {
  businessName: string
  businessType: 'individual' | 'partnership' | 'private_limited' | 'public_limited' | 'llp' | 'retail' | 'wholesale' | 'manufacturing' | 'services' | 'other'
  businessCategory: string
  gstNumber?: string
  panNumber: string
  businessRegistrationNumber?: string
  businessEmail?: string
  businessPhone?: string
  yearEstablished?: number
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
  
  // Addresses (embedded documents)
  addresses: IAddress[]
  
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
  
  // Security fields for login attempts
  loginAttempts: number
  lockUntil?: Date
  isSuspended: boolean
  
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

// Address Schema for embedded documents
const AddressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['registered', 'pickup', 'warehouse', 'other'],
    required: [true, "Address type is required"],
    default: 'registered'
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Full name must be at least 2 characters"],
    maxlength: [60, "Full name cannot exceed 60 characters"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\+?[\d\s\-()]{10,15}$/, "Please enter a valid phone number"],
  },
  addressLine1: {
    type: String,
    required: [true, "Address line 1 is required"],
    trim: true,
    minlength: [5, "Address line 1 must be at least 5 characters"],
    maxlength: [100, "Address line 1 cannot exceed 100 characters"],
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [100, "Address line 2 cannot exceed 100 characters"],
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [50, "Landmark cannot exceed 50 characters"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
    minlength: [2, "City must be at least 2 characters"],
    maxlength: [50, "City cannot exceed 50 characters"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
    minlength: [2, "State must be at least 2 characters"],
    maxlength: [50, "State cannot exceed 50 characters"],
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
    trim: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit postal code"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
    default: 'India',
    minlength: [2, "Country must be at least 2 characters"],
    maxlength: [50, "Country cannot exceed 50 characters"],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: true })

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
    enum: ['individual', 'partnership', 'private_limited', 'public_limited', 'llp', 'retail', 'wholesale', 'manufacturing', 'services', 'other'],
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
    required: [true, "Document type is required"]
  },
  documentUrl: {
    type: String,
    required: [true, "Document URL is required"],
    trim: true
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

// Main Vendor Schema
const VendorSchema = new Schema<IVendor>(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^\+?[\d\s\-()]{10,15}$/, "Please enter a valid mobile number"],
    },
    alternatePhone: {
      type: String,
      match: [/^\+?[\d\s\-()]{10,15}$/, "Please enter a valid phone number"],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    
    // Business Information
    businessInfo: BusinessInfoSchema,
    
    // Addresses
    addresses: [AddressSchema],
    
    // Financial Information
    upiId: {
      type: String,
      required: [true, "UPI ID is required"],
      match: [/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID"],
    },
    
    // Account Status & Verification
    isApproved: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationCode: String,
    emailVerificationExpiry: Date,
    mobileVerificationCode: String,
    mobileVerificationExpiry: Date,
    isBusinessVerified: {
      type: Boolean,
      default: false,
    },
    isGSTVerified: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'under_review', 'rejected'],
      default: 'under_review',
    },
    
    // Security fields for login attempts
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    isSuspended: {
      type: Boolean,
      default: false,
    },
    
    // Products & Inventory
    products: [{
      type: Schema.Types.ObjectId,
      ref: "Product"
    }],
    categories: [{
      type: Schema.Types.ObjectId,
      ref: "Category"
    }],
    totalProducts: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeProducts: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Orders & Sales
    orders: [{
      type: Schema.Types.ObjectId,
      ref: "Order"
    }],
    
    // Performance & Analytics
    performanceMetrics: PerformanceMetricsSchema,
    
    // Settings & Preferences
    settings: {
      autoAcceptOrders: {
        type: Boolean,
        default: false,
      },
      maxOrdersPerDay: {
        type: Number,
        default: 50,
        min: 0,
      },
      workingHours: {
        start: {
          type: String,
          default: "09:00",
        },
        end: {
          type: String,
          default: "18:00",
        },
        workingDays: {
          type: [String],
          default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
      },
      notifications: {
        orderAlerts: {
          type: Boolean,
          default: true,
        },
        paymentAlerts: {
          type: Boolean,
          default: true,
        },
        inventoryAlerts: {
          type: Boolean,
          default: true,
        },
        promotionalEmails: {
          type: Boolean,
          default: true,
        },
      },
    },
    
    // KYC & Documents
    documents: [DocumentSchema],
    
    // Timestamps
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes for better performance
VendorSchema.index({ email: 1 }, { unique: true })
VendorSchema.index({ "businessInfo.businessName": 1 })
VendorSchema.index({ accountStatus: 1 })
VendorSchema.index({ isApproved: 1 })
VendorSchema.index({ createdAt: -1 })

// Virtual property for fullName
VendorSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
})

// Export the model
export const Vendor = mongoose.models?.Vendor
  ? (mongoose.models.Vendor as mongoose.Model<IVendor>)
  : mongoose.model<IVendor>("Vendor", VendorSchema)

import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// Payment method interface
export interface IPaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'wallet'
  cardNumber?: string // Last 4 digits only
  cardType?: 'visa' | 'mastercard' | 'amex' | 'rupay'
  upiId?: string
  walletType?: 'paytm' | 'phonepe' | 'googlepay' | 'amazonpay'
  isDefault: boolean
}

// Preferences interface
export interface IPreferences {
  language: string
  currency: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    orderUpdates: boolean
    promotions: boolean
    recommendations: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    activityTracking: boolean
    dataSharing: boolean
  }
}

// TypeScript Interface
export interface ICustomer extends Document {
  // Basic Information
  firstName: string
  lastName: string
  email: string
  password: string
  mobileNo: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  profileImage?: string
  
  // Account Information
  isEmailVerified: boolean
  isMobileVerified: boolean
  emailVerificationToken?: string
  emailVerificationCode?: string
  emailVerificationExpiry?: Date
  mobileVerificationCode?: string
  mobileVerificationExpiry?: Date
  accountStatus: 'active' | 'suspended' | 'deleted'
  lastLogin?: Date
  
  // Addresses (references to Address model)
  addresses: mongoose.Types.ObjectId[]
  
  // Shopping Information
  orders: string[] // Order IDs
  wishlist: string[] // Product IDs
  cart: Array<{
    productId: string
    quantity: number
    addedAt: Date
  }>
  recentlyViewed: string[] // Product IDs
  
  // Payment Information
  paymentMethods: IPaymentMethod[]
  
  // Preferences & Settings
  preferences: IPreferences
  
  // Analytics & Tracking
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  loyaltyPoints: number
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Payment Method Schema
const PaymentMethodSchema = new Schema<IPaymentMethod>({
  type: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    required: true
  },
  cardNumber: {
    type: String,
    validate: {
      validator: function(v: string) {
        return this.type !== 'card' || (v && v.length === 4)
      },
      message: 'Card number must be last 4 digits'
    }
  },
  cardType: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'rupay']
  },
  upiId: {
    type: String,
    validate: {
      validator: function(v: string) {
        return this.type !== 'upi' || (v && /^[\w.-]+@[\w.-]+$/.test(v))
      },
      message: 'Please enter a valid UPI ID'
    }
  },
  walletType: {
    type: String,
    enum: ['paytm', 'phonepe', 'googlepay', 'amazonpay']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true })

// Preferences Schema
const PreferencesSchema = new Schema({
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    recommendations: { type: Boolean, default: true }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
    activityTracking: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false }
  }
}, { _id: false })

// Cart Item Schema
const CartItemSchema = new Schema({
  productId: {
    type: String,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true })

// Mongoose Schema
const CustomerSchema = new Schema<ICustomer>(
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
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return !v || v <= new Date()
        },
        message: 'Date of birth cannot be in the future'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    profileImage: {
      type: String,
      default: ''
    },

    // Account Information
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
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    },
    lastLogin: {
      type: Date
    },

    // Addresses
    addresses: [EmbeddedAddressSchema],

    // Shopping Information
    orders: [{
      type: String,
      ref: 'Order'
    }],
    wishlist: [{
      type: String,
      ref: 'Product'
    }],
    cart: [CartItemSchema],
    recentlyViewed: [{
      type: String,
      ref: 'Product'
    }],

    // Payment Information
    paymentMethods: [PaymentMethodSchema],

    // Preferences & Settings
    preferences: {
      type: PreferencesSchema,
      default: () => ({})
    },

    // Analytics & Tracking
    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    membershipTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    }
  },
  {
    timestamps: true,
  },
)

// Zod Schemas
export const AddressZodSchema = z.object({
  type: z.enum(['home', 'work', 'other']).default('home'),
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  addressLine1: z.string().min(5, "Address line 1 must be at least 5 characters").trim(),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters").trim(),
  state: z.string().min(2, "State must be at least 2 characters").trim(),
  postalCode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit postal code"),
  country: z.string().default('India'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  isDefault: z.boolean().default(false)
})

export const PaymentMethodZodSchema = z.object({
  type: z.enum(['card', 'upi', 'netbanking', 'wallet']),
  cardNumber: z.string().length(4, "Card number must be last 4 digits").optional(),
  cardType: z.enum(['visa', 'mastercard', 'amex', 'rupay']).optional(),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, "Please enter a valid UPI ID").optional(),
  walletType: z.enum(['paytm', 'phonepe', 'googlepay', 'amazonpay']).optional(),
  isDefault: z.boolean().default(false)
})

export const CustomerZodSchema = z.object({
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
  dateOfBirth: z.date().max(new Date(), "Date of birth cannot be in the future").optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  addresses: z.array(AddressZodSchema).default([]),
  paymentMethods: z.array(PaymentMethodZodSchema).default([])
})

export const CustomerUpdateZodSchema = CustomerZodSchema.partial()

// Export Model
export const Customer = mongoose.models?.Customer
  ? mongoose.models.Customer
  : mongoose.model<ICustomer>("Customer", CustomerSchema);

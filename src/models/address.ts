import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// Address types enum
export type AddressType = 'home' | 'work' | 'business' | 'billing' | 'shipping' | 'registered' | 'pickup' | 'return' | 'warehouse'

// TypeScript Interface for embedded address
export interface IEmbeddedAddress {
  type: AddressType
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

// TypeScript Interface for standalone address document
export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId
  userType: 'customer' | 'vendor' | 'admin'
  type: AddressType
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
  createdAt: Date
  updatedAt: Date
}

// Embedded Address Schema (for use within Customer/Vendor models)
export const EmbeddedAddressSchema = new Schema<IEmbeddedAddress>({
  type: {
    type: String,
    enum: ['home', 'work', 'business', 'billing', 'shipping', 'registered', 'pickup', 'return', 'warehouse'],
    required: [true, "Address type is required"],
    default: 'home'
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Full name must be at least 2 characters"],
    maxlength: [100, "Full name cannot exceed 100 characters"],
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
    maxlength: [100, "Landmark cannot exceed 100 characters"],
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

// Standalone Address Schema (for separate address collection)
const AddressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true,
    },
    userType: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      required: [true, "User type is required"],
    },
    type: {
      type: String,
      enum: ['home', 'work', 'business', 'billing', 'shipping', 'registered', 'pickup', 'return', 'warehouse'],
      required: [true, "Address type is required"],
      default: 'home'
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
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
      maxlength: [100, "Landmark cannot exceed 100 characters"],
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
  },
  {
    timestamps: true,
  },
)

// Zod Schema for embedded address
export const EmbeddedAddressZodSchema = z.object({
  type: z.enum(['home', 'work', 'business', 'billing', 'shipping', 'registered', 'pickup', 'return', 'warehouse']).default('home'),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  phoneNumber: z.string().regex(/^\+?[\d\s\-()]{10,15}$/, "Please enter a valid phone number"),
  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(100, "Address line 1 cannot exceed 100 characters")
    .trim(),
  addressLine2: z.string().max(100, "Address line 2 cannot exceed 100 characters").trim().optional(),
  landmark: z.string().max(100, "Landmark cannot exceed 100 characters").trim().optional(),
  city: z.string().min(2, "City must be at least 2 characters").max(50, "City cannot exceed 50 characters").trim(),
  state: z.string().min(2, "State must be at least 2 characters").max(50, "State cannot exceed 50 characters").trim(),
  postalCode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit postal code"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country cannot exceed 50 characters")
    .trim()
    .default('India'),
  isDefault: z.boolean().default(false),
})

// Zod Schema for standalone address
export const AddressZodSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userType: z.enum(['customer', 'vendor', 'admin']),
  type: z.enum(['home', 'work', 'business', 'billing', 'shipping', 'registered', 'pickup', 'return', 'warehouse']).default('home'),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  phoneNumber: z.string().regex(/^\+?[\d\s\-()]{10,15}$/, "Please enter a valid phone number"),
  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(100, "Address line 1 cannot exceed 100 characters")
    .trim(),
  addressLine2: z.string().max(100, "Address line 2 cannot exceed 100 characters").trim().optional(),
  landmark: z.string().max(100, "Landmark cannot exceed 100 characters").trim().optional(),
  city: z.string().min(2, "City must be at least 2 characters").max(50, "City cannot exceed 50 characters").trim(),
  state: z.string().min(2, "State must be at least 2 characters").max(50, "State cannot exceed 50 characters").trim(),
  postalCode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit postal code"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country cannot exceed 50 characters")
    .trim()
    .default('India'),
  isDefault: z.boolean().default(false),
})

export const AddressUpdateZodSchema = AddressZodSchema.partial()

// Indian states list for validation
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Puducherry'
] as const

// Export Model with type
export const Address = mongoose.models?.Address
  ? (mongoose.models.Address as mongoose.Model<IAddress>)
  : mongoose.model<IAddress>("Address", AddressSchema);
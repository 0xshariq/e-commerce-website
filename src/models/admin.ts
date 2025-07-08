import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// Admin activity log interface
export interface IActivityLog {
  action: string
  module: string
  targetId?: string
  targetType?: string
  details: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// TypeScript Interface - Simplified for Single Admin
export interface IAdmin extends Document {
  // Basic Information
  firstName: string
  lastName: string
  email: string
  password: string
  mobileNo: string
  profileImage?: string
  
  // Account Status
  isActive: boolean
  isEmailVerified: boolean
  isMobileVerified: boolean
  emailVerificationToken?: string
  emailVerificationCode?: string
  emailVerificationExpiry?: Date
  mobileVerificationCode?: string
  mobileVerificationExpiry?: Date
  
  // Access Control
  lastLogin?: Date
  lastPasswordChange: Date
  loginAttempts: number
  lockUntil?: Date
  isSuspended?: boolean
  
  // Activity & Analytics
  activityLogs: IActivityLog[]
  totalActions: number
  totalLogins: number
  
  // Settings & Preferences
  settings: {
    timezone: string
    language: string
    emailNotifications: boolean
    smsNotifications: boolean
    dashboardLayout: 'default' | 'compact' | 'detailed'
    theme: 'light' | 'dark' | 'auto'
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Activity Log Schema
const ActivityLogSchema = new Schema<IActivityLog>({
  action: {
    type: String,
    required: true,
    trim: true
  },
  module: {
    type: String,
    required: true,
    trim: true
  },
  targetId: {
    type: String,
    trim: true
  },
  targetType: {
    type: String,
    enum: ['user', 'vendor', 'product', 'order', 'payment', 'category', 'coupon'],
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP address format"]
  },
  userAgent: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true })

// Settings Schema
const SettingsSchema = new Schema({
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi']
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  dashboardLayout: {
    type: String,
    enum: ['default', 'compact', 'detailed'],
    default: 'default'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  }
}, { _id: false })

// Mongoose Schema - Simplified for Single Admin
const AdminSchema = new Schema<IAdmin>(
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
      match: [/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number"],
    },
    profileImage: {
      type: String,
      default: ''
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true
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

    // Access Control
    lastLogin: {
      type: Date
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    lockUntil: {
      type: Date
    },
    isSuspended: {
      type: Boolean,
      default: false
    },

    // Activity & Analytics
    activityLogs: [ActivityLogSchema],
    totalActions: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLogins: {
      type: Number,
      default: 0,
      min: 0
    },

    // Settings & Preferences
    settings: {
      type: SettingsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
AdminSchema.index({ email: 1 }, { unique: true })
AdminSchema.index({ isActive: 1 })
AdminSchema.index({ createdAt: -1 })

// Virtual property for full name
AdminSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
})

// Zod Schemas - Simplified for Single Admin
export const AdminZodSchema = z.object({
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
  mobileNo: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid mobile number")
})

export const AdminUpdateZodSchema = AdminZodSchema.partial()

// Export Model
export const Admin = mongoose.models?.Admin
  ? (mongoose.models.Admin as mongoose.Model<IAdmin>)
  : mongoose.model<IAdmin>("Admin", AdminSchema)

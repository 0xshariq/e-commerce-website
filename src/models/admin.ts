import mongoose, { Schema, type Document } from "mongoose"
import { z } from "zod"

// Admin permissions interface
export interface IPermission {
  module: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'reject')[]
}

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

// TypeScript Interface
export interface IAdmin extends Document {
  // Basic Information
  firstName: string
  lastName: string
  email: string
  password: string
  mobileNo: string
  employeeId?: string
  profileImage?: string
  
  // Role & Permissions
  role: 'super_admin' | 'admin' | 'moderator' | 'support' | 'finance' | 'operations'
  department: 'general' | 'customer_service' | 'vendor_management' | 'finance' | 'operations' | 'marketing' | 'technical'
  permissions: IPermission[]
  
  // Account Status
  isActive: boolean
  isEmailVerified: boolean
  isMobileVerified: boolean
  accountStatus: 'active' | 'inactive' | 'suspended' | 'terminated'
  
  // Work Information
  designation: string
  reportingTo?: string // Admin ID
  joiningDate: Date
  workLocation: 'office' | 'remote' | 'hybrid'
  
  // Access Control
  allowedIPAddresses: string[]
  lastLogin?: Date
  lastPasswordChange: Date
  loginAttempts: number
  lockedUntil?: Date
  
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
  
  // Emergency Access
  emergencyContacts: Array<{
    name: string
    relationship: string
    phone: string
    email: string
  }>
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Permission Schema
const PermissionSchema = new Schema<IPermission>({
  module: {
    type: String,
    required: true,
    enum: ['users', 'vendors', 'products', 'orders', 'payments', 'analytics', 'settings', 'content', 'support']
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'approve', 'reject']
  }]
}, { _id: false })

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

// Emergency Contact Schema
const EmergencyContactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"]
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
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

// Mongoose Schema
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
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    profileImage: {
      type: String,
      default: ''
    },

    // Role & Permissions
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator', 'support', 'finance', 'operations'],
      default: 'admin'
    },
    department: {
      type: String,
      enum: ['general', 'customer_service', 'vendor_management', 'finance', 'operations', 'marketing', 'technical'],
      default: 'general'
    },
    permissions: [PermissionSchema],

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
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'terminated'],
      default: 'active'
    },

    // Work Information
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true
    },
    reportingTo: {
      type: String,
      ref: 'Admin'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office'
    },

    // Access Control
    allowedIPAddresses: [{
      type: String,
      match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP address format"]
    }],
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
    lockedUntil: {
      type: Date
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
    },

    // Emergency Access
    emergencyContacts: [EmergencyContactSchema]
  },
  {
    timestamps: true,
  },
)

// Zod Schemas
export const PermissionZodSchema = z.object({
  module: z.enum(['users', 'vendors', 'products', 'orders', 'payments', 'analytics', 'settings', 'content', 'support']),
  actions: z.array(z.enum(['create', 'read', 'update', 'delete', 'approve', 'reject']))
})

export const EmergencyContactZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  relationship: z.string().min(2, "Relationship must be specified").trim(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address")
})

export const AdminZodSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(30, "First name cannot exceed 30 characters").trim(),
  lastName: z.string().min(1, "Last name must be at least 1 character").max(30, "Last name cannot exceed 30 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  mobileNo: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number"),
  employeeId: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'moderator', 'support', 'finance', 'operations']).default('admin'),
  department: z.enum(['general', 'customer_service', 'vendor_management', 'finance', 'operations', 'marketing', 'technical']).default('general'),
  designation: z.string().min(2, "Designation is required").trim(),
  workLocation: z.enum(['office', 'remote', 'hybrid']).default('office'),
  permissions: z.array(PermissionZodSchema).default([]),
  emergencyContacts: z.array(EmergencyContactZodSchema).default([])
})

export const AdminUpdateZodSchema = AdminZodSchema.partial()

// Export Model
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)

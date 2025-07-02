import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/database"
import { Customer,CustomerZodSchema } from "@/models/customer"
import { Vendor,VendorZodSchema } from "@/models/vendor"
import { Admin,AdminZodSchema } from "@/models/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role } = body

    if (!role || !["customer", "vendor", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid or missing role" }, { status: 400 })
    }

    await dbConnect()

    // Role-specific validation and creation
    switch (role) {
      case "customer": {
        // Validate using Customer Zod schema
        const validatedData = CustomerZodSchema.parse({
          name: body.name,
          email: body.email,
          password: body.password,
          mobileNo: body.mobileNo,
          productsPurchased: [],
          address: body.address || "",
        })

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email: validatedData.email })
        if (existingCustomer) {
          return NextResponse.json({ error: "Customer with this email already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)

        // Create customer according to Customer model
        const customer = await Customer.create({
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          mobileNo: validatedData.mobileNo,
          productsPurchased: [],
          address: validatedData.address,
        })

        return NextResponse.json(
          {
            message: "Customer account created successfully",
            id: customer._id,
            role: "customer",
          },
          { status: 201 },
        )
      }

      case "vendor": {
        // Validate using Vendor Zod schema
        const validatedData = VendorZodSchema.parse({
          name: body.name,
          email: body.email,
          password: body.password,
          mobileNo: body.mobileNo,
          shopAddress: body.shopAddress,
          upiId: body.upiId,
          availableProducts: [],
          isApproved: false,
        })

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email: validatedData.email })
        if (existingVendor) {
          return NextResponse.json({ error: "Vendor with this email already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)

        // Create vendor according to Vendor model
        const vendor = await Vendor.create({
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          mobileNo: validatedData.mobileNo,
          shopAddress: validatedData.shopAddress,
          upiId: validatedData.upiId,
          availableProducts: [],
          isApproved: false, // Vendors need admin approval
        })

        return NextResponse.json(
          {
            message: "Vendor account created successfully. Awaiting admin approval.",
            id: vendor._id,
            role: "vendor",
          },
          { status: 201 },
        )
      }

      case "admin": {
        // Verify admin key first
        if (!body.adminKey || body.adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
          return NextResponse.json({ error: "Invalid admin registration key" }, { status: 403 })
        }

        // Validate using Admin Zod schema
        const validatedData = AdminZodSchema.parse({
          name: body.name,
          email: body.email,
          password: body.password,
          mobileNo: body.mobileNo,
          userActivity: "", // Will be populated later with Activity reference
        })

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: validatedData.email })
        if (existingAdmin) {
          return NextResponse.json({ error: "Admin with this email already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)

        // Create admin according to Admin model
        const admin = await Admin.create({
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          mobileNo: validatedData.mobileNo,
          userActivity: "", // Will be populated later when Activity is created
        })

        return NextResponse.json(
          {
            message: "Admin account created successfully",
            id: admin._id,
            role: "admin",
          },
          { status: 201 },
        )
      }

      default:
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Registration error:", error)

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      const errorMessages = error.errors.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(", ")
      return NextResponse.json(
        {
          error: "Validation failed",
          details: errorMessages,
        },
        { status: 400 },
      )
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        {
          error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        },
        { status: 400 },
      )
    }

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(", ")
      return NextResponse.json(
        {
          error: "Database validation failed",
          details: errorMessages,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

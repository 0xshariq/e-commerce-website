import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      phone,
      mobileNo, // Keep backward compatibility
      role,
      businessName,
      businessAddress,
      businessType,
      department,
      address
    } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, role" },
        { status: 400 }
      )
    }

    // Use phone or mobileNo for backward compatibility
    const phoneNumber = phone || mobileNo

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists in any collection
    const existingCustomer = await Customer.findOne({ email })
    const existingVendor = await Vendor.findOne({ email })
    const existingAdmin = await Admin.findOne({ email })

    if (existingCustomer || existingVendor || existingAdmin) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user based on role
    let newUser
    let message = "Account created successfully!"

    switch (role) {
      case "customer":
        newUser = new Customer({
          name,
          email,
          password: hashedPassword,
          mobileNo: phoneNumber || "",
          productsPurchased: [],
          address: address || "",
          createdAt: new Date(),
        })
        break

      case "vendor":
        if (!businessName) {
          return NextResponse.json(
            { error: "Business name is required for vendor accounts" },
            { status: 400 }
          )
        }

        newUser = new Vendor({
          name,
          email,
          password: hashedPassword,
          mobileNo: phoneNumber || "",
          businessName,
          shopAddress: businessAddress || "",
          businessType: businessType || "Individual Seller",
          isApproved: false, // Vendors need admin approval
          createdAt: new Date(),
        })
        message = "Vendor account created! Pending admin approval."
        break

      case "admin":
        newUser = new Admin({
          name,
          email,
          password: hashedPassword,
          mobileNo: phoneNumber || "",
          department: department || "General",
          permissions: ["read"], // Basic permissions, can be upgraded later
          isActive: false, // Admins need super admin approval
          createdAt: new Date(),
        })
        message = "Admin account created! Pending super admin approval."
        break

      default:
        return NextResponse.json(
          { error: "Invalid role specified. Must be customer, vendor, or admin" },
          { status: 400 }
        )
    }

    await newUser.save()

    // Remove password from response
    const userResponse = newUser.toObject()
    delete userResponse.password

    return NextResponse.json(
      { 
        message,
        user: userResponse,
        role
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: validationErrors.join(", ") },
        { status: 400 }
      )
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

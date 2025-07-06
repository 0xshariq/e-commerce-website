import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Coupon, CouponZodSchema } from "@/models/coupon"
import { Product } from "@/models/product"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    await connectDB()

    const coupons = await Coupon.find({
      productId: params.productId,
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).populate("vendorId", "businessName")

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error("Error fetching product coupons:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate with Zod schema
    const validation = CouponZodSchema.safeParse({
      ...body,
      expiryDate: new Date(body.expiryDate)
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: validation.data.code })
    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const coupon = new Coupon({
      ...validation.data,
      vendorId: session.user.id,
      productId: params.productId,
    })

    await coupon.save()
    await coupon.populate("vendorId", "businessName")

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const deletedCount = await Coupon.deleteMany({ productId: params.productId, vendorId: session.user.id })

    if (deletedCount.deletedCount === 0) {
      return NextResponse.json({ error: "No coupons found for this product" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupons deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupons:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { couponId, ...updateData } = body

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    // Validate with partial Zod schema
    const validation = CouponZodSchema.partial().safeParse({
      ...updateData,
      expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : undefined
    })

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session.user.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const coupon = await Coupon.findOneAndUpdate(
      {
        _id: couponId,
        productId: params.productId,
        vendorId: session.user.id,
      },
      validation.data,
      { new: true, runValidators: true },
    ).populate("vendorId", "businessName")

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found or unauthorized" }, { status: 404 })
    }   

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
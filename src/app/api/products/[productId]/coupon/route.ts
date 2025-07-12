import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/database"
import { Coupon, CouponZodSchema } from "@/models/coupon"
import { Product } from "@/models/product"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const couponType = searchParams.get('type')
    const isActive = searchParams.get('active')

    // Build query
    const query: any = { productId: params.productId }
    
    if (isActive !== 'false') {
      query.isActive = true
      query.expiryDate = { $gte: new Date() }
    }
    
    if (couponType && ['normal', 'special'].includes(couponType)) {
      query.couponType = couponType
    }

    const coupons = await Coupon.find(query)
      .populate("vendorId", "businessName contactPersonName email")
      .populate("productId", "productName imageUrl productPrice")
      .sort({ createdAt: -1 })

    // Add calculated fields
    const couponsWithStats = coupons.map(coupon => {
      const couponObj = coupon.toObject()
      const daysUntilExpiry = Math.ceil((coupon.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const usagePercentage = (coupon.usedCount / coupon.usageLimit) * 100

      return {
        ...couponObj,
        isValid: (coupon.expiryDate > new Date() && coupon.isActive && coupon.usedCount < coupon.usageLimit),
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        usagePercentage: Math.round(usagePercentage * 10) / 10,
        remainingUses: Math.max(0, coupon.usageLimit - coupon.usedCount),
        isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry > 0,
        canApplyUserLimit: coupon.couponType === 'special'
      }
    })

    return NextResponse.json({ 
      coupons: couponsWithStats,
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isValidCoupon()).length,
      normalCoupons: coupons.filter(c => c.couponType === 'normal').length,
      specialCoupons: coupons.filter(c => c.couponType === 'special').length
    })
  } catch (error) {
    console.error("Error fetching product coupons:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "vendor") {
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
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
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
      vendorId: session?.user?.id,
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

    if (!session || session?.user?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Verify product belongs to vendor
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const deletedCount = await Coupon.deleteMany({ productId: params.productId, vendorId: session?.user?.id })

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

    if (!session || session?.user?.role !== "vendor") {
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
    const product = await Product.findOne({ _id: params.productId, vendorId: session?.user?.id })
    if (!product) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const coupon = await Coupon.findOneAndUpdate(
      {
        _id: couponId,
        productId: params.productId,
        vendorId: session?.user?.id,
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
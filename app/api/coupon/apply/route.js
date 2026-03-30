import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { zSchema } from "@/lib/zodSchema"
import CouponModel from "@/models/Coupon.model"

export async function POST(request) {
  try {
    await connectDB()

    const payload = await request.json()

    const couponFormSchema = zSchema.pick({
      code: true,
      minShoppingAmount: true,
    })

    const validate = couponFormSchema.safeParse(payload)
    if (!validate.success) {
      return response(false, 400, "Missing or invalid data.", validate.error)
    }

    const { code, minShoppingAmount } = validate.data

    // findOne (not find)
    const couponData = await CouponModel.findOne({ code }).lean()

    if (!couponData) {
      return response(false, 400, "Invalid coupon code.")
    }

    // expiry check
    if (new Date() > new Date(couponData.validTill)) {
      return response(false, 400, "Coupon code expired.")
    }

    // minimum cart value check
    if (minShoppingAmount < couponData.minShoppingAmount) {
      return response(
        false,
        400,
        `Minimum shopping amount should be ₹${couponData.minShoppingAmount}`
      )
    }

    return response(true, 200, "Coupon applied successfully", {
      discountPercentage: couponData.discountPercentage,
      maxDiscountAmount: couponData.maxDiscountAmount || null,
    })

  } catch (error) {
    return catchError(error)
  }
}


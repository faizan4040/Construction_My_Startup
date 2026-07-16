import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperfunction"
import ReviewModel from "@/models/Review.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 })

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return NextResponse.json({ success: false, message: "No shop linked." }, { status: 400 })

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const { searchParams } = new URL(request.url)
    const start = parseInt(searchParams.get("start") || "0", 10)
    const size = parseInt(searchParams.get("size") || "10", 10)
    const globalFilter = searchParams.get("globalFilter") || ""
    const deleteType = searchParams.get("deleteType")

    let filters = []
    let sorting = []
    try {
      filters = JSON.parse(searchParams.get("filters") || "[]")
      sorting = JSON.parse(searchParams.get("sorting") || "[]")
    } catch {}

    const matchQuery = {
      deletedAt: deleteType === "PD" ? { $ne: null } : null,
      product: { $in: shopProductIds },
    }
    if (globalFilter) {
      matchQuery.$or = [{ title: new RegExp(globalFilter, "i") }, { review: new RegExp(globalFilter, "i") }]
    }
    filters.forEach((f) => { matchQuery[f.id] = new RegExp(f.value, "i") })

    let sortQuery = { createdAt: -1 }
    if (sorting.length) {
      sortQuery = {}
      sorting.forEach((s) => { sortQuery[s.id] = s.desc ? -1 : 1 })
    }

    const totalRowCount = await ReviewModel.countDocuments(matchQuery)
    const reviews = await ReviewModel.find(matchQuery)
      .populate("product", "name slug")
      .populate("user", "name email")
      .sort(sortQuery)
      .skip(start)
      .limit(size)
      .lean()

    return NextResponse.json({ success: true, data: reviews, meta: { totalRowCount } })
  } catch (error) {
    return catchError(error)
  }
}
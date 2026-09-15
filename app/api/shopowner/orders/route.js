import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
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
    const statusFilter = searchParams.get("status") || null   // ✅ NEW — tabs ke liye

    let filters = []
    let sorting = []
    try {
      filters = JSON.parse(searchParams.get("filters") || "[]")
      sorting = JSON.parse(searchParams.get("sorting") || "[]")
    } catch {}

    const matchQuery = {
      deleteAt: deleteType === "PD" ? { $ne: null } : null,
      "products.productId": { $in: shopProductIds },
    }

    // ✅ NEW — sirf is shop ke product-level status ke hisaab se filter
    // Note: matchQuery yahan poore order-document pe filter karta hai
    // (aggregation se pehle), isliye ye check karta hai ki order ke
    // "products" array me is shop ka koi item us status me hai ya nahi.
    if (statusFilter) {
      matchQuery["products"] = {
        $elemMatch: {
          productId: { $in: shopProductIds },
          status: statusFilter,
        },
      }
    }

    if (globalFilter) {
      matchQuery.$or = [
        { order_id: new RegExp(globalFilter, "i") },
        { payment_id: new RegExp(globalFilter, "i") },
        { name: new RegExp(globalFilter, "i") },
        { email: new RegExp(globalFilter, "i") },
        { phone: new RegExp(globalFilter, "i") },
      ]
    }

    filters.forEach((f) => { matchQuery[f.id] = new RegExp(f.value, "i") })

    let sortQuery = { createdAt: -1 }
    if (sorting.length) {
      sortQuery = {}
      sorting.forEach((s) => { sortQuery[s.id] = s.desc ? -1 : 1 })
    }

    const totalRowCount = await OrderModel.countDocuments(matchQuery)

    const orders = await OrderModel.aggregate([
      { $match: matchQuery },
      { $sort: sortQuery },
      { $skip: start },
      { $limit: size },
    {
  $project: {
    order_id: 1,
    payment_id: 1,
    name: 1,
    email: 1,
    phone: 1,
    address: 1,       // ✅ ADD
    landmark: 1,       // ✅ ADD
    paymentStatus: 1,  // ✅ ADD
    country: 1,
    state: 1,
    city: 1,
    pincode: 1,
    discount: 1,
    couponDiscount: 1,
    createdAt: 1,
    products: {
      $filter: {
        input: "$products",
        as: "p",
        cond: { $in: ["$$p.productId", shopProductIds] },
      },
    },
  },
},
      {
        $addFields: {
          // this shop's slice of the order, not the buyer's full cart total
          totalAmount: {
            $sum: { $map: { input: "$products", as: "p", in: { $multiply: ["$$p.qty", "$$p.sellingPrice"] } } },
          },
          // display status = this shop's own item status (never the whole order's status)
          status: { $ifNull: [{ $arrayElemAt: ["$products.status", 0] }, "on_hold"] },  // ✅ CHANGED: "pending" → "on_hold" (naya default)
        },
      },
    ])

    await OrderModel.populate(orders, [
      { path: "products.productId", select: "name slug" },
      { path: "products.variantId", populate: { path: "media", select: "secure_url url path" } },
    ])

    return NextResponse.json({ success: true, data: orders, meta: { totalRowCount } })
  } catch (error) {
    return catchError(error)
  }
}
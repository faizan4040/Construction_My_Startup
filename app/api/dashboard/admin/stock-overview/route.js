import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { response, catchError } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ProductVariantModel from "@/models/ProductVariant.model"

const LOW_STOCK_LIMIT = 5

export async function GET() {
  try {
    // Admin Auth
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized")
    }

    await connectDB()

    /* ---------------- SOLD DATA ---------------- */
    const soldData = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.variantId",
          totalSold: { $sum: "$products.qty" },
        },
      },
    ])

    const soldMap = {}
    soldData.forEach(item => {
      soldMap[item._id.toString()] = item.totalSold
    })

    /* ---------------- VARIANTS WITH PRODUCT + MEDIA ---------------- */
    const variants = await ProductVariantModel.find({
      deletedAt: null,
    })
      .populate({
        path: "product",
        select: "name media thumbnail",
        populate: {
          path: "media",
          select: "secure_url url path",
        },
      })
      .lean()

    /* ---------------- BUILD STOCK TABLE ---------------- */
    const stockTable = variants.map(v => {
      const sold = soldMap[v._id.toString()] || 0
      const remaining = Number(v.stock ?? 0)

      let status = "In Stock"
      if (remaining === 0) status = "Out of Stock"
      else if (remaining <= LOW_STOCK_LIMIT) status = "Low Stock"

      // SAFE IMAGE PICK
      const image =
        v.product?.thumbnail ||
        v.product?.media?.[0]?.secure_url ||
        v.product?.media?.[0]?.url ||
        v.product?.media?.[0]?.path ||
        null

      return {
        variantId: v._id,
        productName: v.product?.name || "—",
        sku: v.sku,
        image, // frontend directly use karega
        totalSold: sold,
        remainingStock: remaining,
        status,
      }
    })

    /* ---------------- LOW STOCK ---------------- */
    const lowStock = stockTable.filter(
      item => item.status === "Low Stock"
    )

    /* ---------------- MOST SOLD ---------------- */
    const mostSold = [...stockTable]
      .filter(item => item.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    return response(true, 200, "Stock report fetched", {
      stockTable,
      mostSold,
      lowStock,
    })
  } catch (error) {
    console.error("STOCK REPORT ERROR:", error)
    return catchError(error)
  }
}



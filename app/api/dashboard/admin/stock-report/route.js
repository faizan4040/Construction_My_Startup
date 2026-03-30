import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { response, catchError } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import { NextResponse } from "next/server"

const LOW_STOCK_LIMIT = 5

export async function GET() {
  try {
    // Admin auth
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized")
    }

    await connectDB()

    // Total sold per variant
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

    // Fetch variants with REAL stock
    const variants = await ProductVariantModel.find({
      deletedAt: null,
    })
      .populate("product", "name")
      .lean()

      const stockTable = variants.map(v => {
      const sold = soldMap[v._id.toString()] || 0
      const remaining = Number(v.stock || 0) 

      return {
        variantId: v._id,
        productName: v.product?.name || "N/A",
        sku: v.sku,
        totalSold: sold,
        remainingStock: remaining,
        status:
          remaining === 0
            ? "Out of Stock"
            : remaining <= LOW_STOCK_LIMIT
            ? "Low Stock"
            : "In Stock",
      }
    })

    // Sort: low stock first (admin-friendly)
    stockTable.sort((a, b) => a.remainingStock - b.remainingStock)

    // Most sold products
    const mostSold = [...stockTable]
      .filter(item => item.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        stockTable,
        mostSold,
      },
    })
  } catch (error) {
    console.error("STOCK OVERVIEW ERROR:", error)
    return catchError(error)
  }
}
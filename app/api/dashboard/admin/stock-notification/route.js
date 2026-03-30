import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductVariantModel from "@/models/ProductVariant.model"
import OrderModel from "@/models/Order.model"

const LOW_STOCK_LIMIT = 5

export async function GET() {
  try {
    // Auth
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized")

    await connectDB()

    // Get total sold per variant from orders (REAL DATA)
    const soldData = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.variantId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
    ])

    // Convert sold array → map for fast lookup
    const soldMap = {}
    soldData.forEach(item => {
      soldMap[item._id.toString()] = item.totalSold
    })

    // Fetch product variants
    const variants = await ProductVariantModel.find({
      deletedAt: null,
    })
      .populate("product", "name")
      .populate("media", "url")
      .lean()

    // Build stock table (REAL CALCULATIONS)
    const stockTable = variants.map(v => {
      const sold = soldMap[v._id.toString()] || 0
      const stock = Number(v.stock) || 0

      let status = "In Stock"
      if (stock === 0) status = "Out of Stock"
      else if (stock <= LOW_STOCK_LIMIT) status = "Low Stock"

      return {
        variantId: v._id,
        productName: v.product?.name || "N/A",
        sku: v.sku,
        image: v.media?.[0]?.url || null,
        totalSold: sold,
        remainingStock: stock,
        status, 
      }
    })

    // Top 5 most sold
    const mostSold = [...stockTable]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    return response(true, 200, "Stock fetched successfully", {
      stockTable,
      mostSold,
    })

  } catch (error) {
    return catchError(error)
  }
}







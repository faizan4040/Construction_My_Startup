import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET() {
  try {
    await connectDB();

    const allVariants = await ProductVariantModel.find({ deletedAt: null })
      .populate("product", "name")
      .sort({ stock: -1 });

    const stockTable = allVariants.map(v => ({
      variantId: v._id,
      productName: v.product?.name || "Unknown",
      sku: v.sku,
      totalSold: v.totalSold || 0,
      remainingStock: v.stock || 0,
      status:
        v.stock === 0
          ? "Out of Stock"
          : v.stock <= 5
          ? "Low Stock"
          : "In Stock",
    }));

    const mostSold = allVariants
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 5)
      .map(v => ({
        variantId: v._id,
        productName: v.product?.name || "Unknown",
        sku: v.sku,
        totalSold: v.totalSold || 0,
      }));

    return response(true, 200, "Stock fetched successfully", { stockTable, mostSold });
  } catch (error) {
    return catchError(error);
  }
}
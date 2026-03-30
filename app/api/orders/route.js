import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OrderModel from "@/models/Order.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    //  Admin auth
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    //  Connect DB
    await connectDB();

    //  Query Params
    const { searchParams } = new URL(request.url);

    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const globalFilter = searchParams.get("globalFilter") || "";
    const deleteType = searchParams.get("deleteType");

    let filters = [];
    let sorting = [];

    try {
      filters = JSON.parse(searchParams.get("filters") || "[]");
      sorting = JSON.parse(searchParams.get("sorting") || "[]");
    } catch {}

    //  MATCH QUERY
    let matchQuery = {
      deletedAt: deleteType === "PD" ? { $ne: null } : null,
    };

    //  Global search
    if (globalFilter) {
      matchQuery.$or = [
        { order_id: new RegExp(globalFilter, "i") },
        { payment_id: new RegExp(globalFilter, "i") },
        { name: new RegExp(globalFilter, "i") },
        { email: new RegExp(globalFilter, "i") },
        { phone: new RegExp(globalFilter, "i") },
        { status: new RegExp(globalFilter, "i") },
      ];
    }

    //  Column filters
    filters.forEach((f) => {
      matchQuery[f.id] = new RegExp(f.value, "i");
    });

    //  Sorting
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((s) => {
        sortQuery[s.id] = s.desc ? -1 : 1;
      });
    }

    //  FETCH ORDERS WITH PRODUCT & VARIANT DETAILS
    const orders = await OrderModel.find(matchQuery)
      .sort(sortQuery)
      .skip(start)
      .limit(size)
      .populate({
        path: "products.productId",
        select: "name slug",
      })
      .populate({
        path: "products.variantId",
        populate: {
          path: "media",
          select: "secure_url url path",
        },
      })
      .lean();

    //  Count total orders
    const totalRowCount = await OrderModel.countDocuments(matchQuery);

    // -----------------------
    //  LOW STOCK PRODUCTS
    // -----------------------
    const LOW_STOCK_THRESHOLD = 5; // Set your threshold
    const lowStock = await ProductVariantModel.find({
      stock: { $lte: LOW_STOCK_THRESHOLD },
      deletedAt: null,
    })
      .populate("product", "name")
      .sort({ stock: 1 })
      .limit(10); // Top 10 low stock products

    // -----------------------
    //  MOST SOLD PRODUCTS
    // -----------------------
    const mostSoldAggregation = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.variantId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }, // Top 10 most sold
    ]);

    const mostSold = await ProductVariantModel.populate(mostSoldAggregation, {
      path: "_id",
      select: "sku product",
      populate: { path: "product", select: "name" },
    });

    //  FINAL RESPONSE
    return NextResponse.json({
      success: true,
      data: orders,
      meta: { totalRowCount },
      lowStock,   // Low stock items
      mostSold,   // Most sold products
    });
  } catch (error) {
    console.error("ORDERS API ERROR:", error);
    return catchError(error);
  }
}



















import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import WarehouseModel from "@/models/Warehouse.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");

    // Default match
    let matchQuery = { deletedAt: null };

    if (deleteType === "PD") {
      matchQuery = { deletedAt: { $ne: null } };
    }

    // Global search
    if (globalFilter) {
      matchQuery.$or = [
        { name: { $regex: globalFilter, $options: "i" } },
        { location: { $regex: globalFilter, $options: "i" } },
        { city: { $regex: globalFilter, $options: "i" } },
        { manager: { $regex: globalFilter, $options: "i" } },
        { slug: { $regex: globalFilter, $options: "i" } },
      ];
    }

    // Column filters (safe)
    filters.forEach((filter) => {
      if (filter?.id && filter?.value) {
        matchQuery[filter.id] = {
          $regex: filter.value,
          $options: "i",
        };
      }
    });

    // Sorting
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((sort) => {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      });
    }

    const data = await WarehouseModel.aggregate([
      { $match: matchQuery },
      { $sort: sortQuery },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          name: 1,
          location: 1,
          city: 1,
          state: 1,
          manager: 1,
          capacity: 1,
          currentStock: 1,
          status: 1,
          slug: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ]);

    const totalRowCount = await WarehouseModel.countDocuments(matchQuery);

    return NextResponse.json({
      success: true,
      data,
      meta: { totalRowCount },
    });
  } catch (error) {
    console.error("WAREHOUSE LIST API ERROR:", error);
    return catchError(error);
  }
}
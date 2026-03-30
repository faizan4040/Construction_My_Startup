import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Authenticate admin
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    // Connect DB
    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);

    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);

    let filters = [];
    try {
      filters = JSON.parse(searchParams.get("filters") || "[]");
    } catch {}

    const globalFilter = searchParams.get("globalFilter") || "";

    let sorting = [];
    try {
      sorting = JSON.parse(searchParams.get("sorting") || "[]");
    } catch {}

    const deleteType = searchParams.get("deleteType");

    // Build base match query
    let matchQuery = {};
    if (deleteType === "SD") {
      matchQuery.deletedAt = null;
    } else if (deleteType === "PD") {
      matchQuery.deletedAt = { $ne: null };
    } else {
      matchQuery.deletedAt = null;
    }

    // Global search
    if (globalFilter) {
      matchQuery.$or = [
        { name: { $regex: globalFilter, $options: "i" } },
        { email: { $regex: globalFilter, $options: "i" } },
        { phone: { $regex: globalFilter, $options: "i" } },
        { address: { $regex: globalFilter, $options: "i" } },
      ];

      // Boolean search
      if (globalFilter === "true" || globalFilter === "false") {
        matchQuery.$or.push({
          isEmailVerified: globalFilter === "true",
        });
      }
    }

    // Column filters
    filters.forEach((filter) => {
      if (!filter?.id || filter?.value === "") return;

      if (filter.id === "isEmailVerified") {
        matchQuery[filter.id] = filter.value === "true";
      } else {
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

    // Aggregation
    const customers = await UserModel.aggregate([
      { $match: matchQuery },
      { $sort: sortQuery },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          avatar: 1,
          isEmailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ]);

    // Total count
    const totalRowCount = await UserModel.countDocuments(matchQuery);

    // Response
    return NextResponse.json({
      success: true,
      data: customers,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}

import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CouponModel from "@/models/Coupon.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    //  Authenticate admin
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    // Connect to DB
    await connectDB();

    //  Parse searchParams
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

    // Build match query
let matchQuery;
if (deleteType === "SD") {
  matchQuery = { deletedAt: null };
} else if (deleteType === "PD") {
  matchQuery = { deletedAt: { $ne: null } };
} else {
  matchQuery = { deletedAt: null };
}

// YAHI PE ADD KARNA HAI
matchQuery.validity = { $gte: new Date() };



    // Global search
    if (globalFilter) {
      matchQuery.$or = [
        { code: { $regex: globalFilter, $options: "i" } },
        {
          $expr: {
            $regexMatch:{
              input: {$toString: "$minShoppingAmount"},
              regex: globalFilter,
              options: 'i'
            }
          }
        },
        {
          $expr: {
            $regexMatch:{
              input: {$toString: "$discountPercentage"},
              regex: globalFilter,
              options: 'i'
            }
          }
        }
      ];
    }

// Column filters
filters.forEach((filter) => {
  if (!filter?.id || filter?.value === undefined || filter?.value === '') return;

  // Numeric fields
  if (
    filter.id === 'minShoppingAmount' ||
    filter.id === 'discountPercentage'
  ) {
    matchQuery[filter.id] = Number(filter.value);
  }

  // Date field
  else if (filter.id === 'validity') {
    matchQuery[filter.id] = new Date(filter.value);
  }

  // String fields
  else {
    matchQuery[filter.id] = {
      $regex: filter.value,
      $options: 'i',
    };
  }
});


   //  Sorting
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((sort) => {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      });
    }

    // Aggregation pipeline
    const getCoupon = await CouponModel.aggregate([
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          code: 1,
          discountPercentage: 1,
          minShoppingAmount: 1,
          validity: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ]);



    //  Get total count
    const totalRowCount = await CouponModel.countDocuments(matchQuery);

    //  Return response
    return NextResponse.json({
      success: true,
      data: getCoupon,
      meta: { totalRowCount },
    });
  } catch (error) {
    console.error("COUPON API ERROR:", error);
    return catchError(error);
  }
}

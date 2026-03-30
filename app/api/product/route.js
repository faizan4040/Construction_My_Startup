import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductModel from "@/models/Product.model";
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
      matchQuery = { deletedAt: null }; // Active products
    } else if (deleteType === "PD") {
      matchQuery = { deletedAt: { $ne: null } }; // Soft-deleted products
    } else {
      matchQuery = { deletedAt: null }; // Default active products
    }

    // Global search
    if (globalFilter) {
      matchQuery.$or = [
        { name: { $regex: globalFilter, $options: "i" } },
        { slug: { $regex: globalFilter, $options: "i" } },
        { "categoryData.name": { $regex: globalFilter, $options: "i" } },
        {
          $expr: {
            $regexMatch:{
              input: {$toString: "$mrp"},
              regex: globalFilter,
              options: 'i'
            }
          }
        },
        {
          $expr: {
            $regexMatch:{
              input: {$toString: "$sellingPrice"},
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
    filter.id === 'mrp' ||
    filter.id === 'sellingPrice' ||
    filter.id === 'discountPercentage'
  ) {
    matchQuery[filter.id] = Number(filter.value);
  } 
  // String fields
  else {
    matchQuery[filter.id] = {
      $regex: filter.value,
      $options: 'i',
    };
  }
});


 

    //  Build sort query
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((sort) => {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      });
    }

    // Aggregation pipeline
    // const getProduct = await ProductModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "categories",
    //       localField: "category",
    //       foreignField: "_id",
    //       as: "categoryData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$categoryData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   { $match: matchQuery },
    //   { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
    //   { $skip: start },
    //   { $limit: size },
    //   {
    //     $project: {
    //       _id: 1,
    //       name: 1,
    //       slug: 1,
    //       mrp: 1,
    //       sellingPrice: 1,
    //       discountPercentage: 1,
    //       category: "$categoryData.name",
    //       createdAt: 1,
    //       updatedAt: 1,
    //       deletedAt: 1,
    //     },
    //   },
    // ]);

    const getProduct = await ProductModel.aggregate([
  // CATEGORY
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryData",
    },
  },
  { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },

  // VARIANTS
  {
    $lookup: {
      from: "productvariants",
      localField: "_id",
      foreignField: "product",
      as: "variants",
    },
  },

  // PICK FIRST VARIANT
  {
    $addFields: {
      variant: { $arrayElemAt: ["$variants", 0] },
    },
  },

  // MEDIA FROM VARIANT
  {
    $lookup: {
      from: "media",
      localField: "variant.media",
      foreignField: "_id",
      as: "media",
    },
  },

  // PICK FIRST IMAGE
  {
    $addFields: {
      image: {
        $ifNull: [
          { $arrayElemAt: ["$media.secure_url", 0] },
          { $arrayElemAt: ["$media.url", 0] },
        ],
      },
    },
  },

  { $match: matchQuery },
  { $sort: sortQuery },
  { $skip: start },
  { $limit: size },

  // FINAL SHAPE
  {
    $project: {
      name: 1,
      slug: 1,
      mrp: 1,
      sellingPrice: 1,
      discountPercentage: 1,
      category: "$categoryData.name",
      image: 1,
      createdAt: 1,
    },
  },
]);



    //  Get total count
    const totalRowCount = await ProductModel.countDocuments(matchQuery);

    //  Return response
    return NextResponse.json({
      success: true,
      data: getProduct,
      meta: { totalRowCount },
    });
  } catch (error) {
    console.error("PRODUCT API ERROR:", error);
    return catchError(error);
  }
}

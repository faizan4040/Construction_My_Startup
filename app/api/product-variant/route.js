import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductVariantModel from "@/models/ProductVariant.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const start = parseInt(searchParams.get("start") || "0");
    const size = parseInt(searchParams.get("size") || "10");

    const globalFilter = searchParams.get("globalFilter") || "";
    const genderFilter = searchParams.get("gender");
    const deleteType = searchParams.get("deleteType");

    let sorting = [];
    try {
      sorting = JSON.parse(searchParams.get("sorting") || "[]");
    } catch {}

    // -----------------------------
    //  BASE MATCH (Variant Fields)
    // -----------------------------
    let baseMatch = {};

    if (deleteType === "PD") {
      baseMatch.deletedAt = { $ne: null };
    } else {
      baseMatch.deletedAt = null;
    }

    if (genderFilter) {
      baseMatch.gender = genderFilter;
    }

    // -----------------------------
    //  SORT
    // -----------------------------
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((sort) => {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      });
    }

    // -----------------------------
    //  GLOBAL SEARCH (AFTER LOOKUP)
    // -----------------------------
    let lookupMatch = {};

    if (globalFilter) {
      lookupMatch.$or = [
        { "productData.name": { $regex: globalFilter, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$mrp" },
              regex: globalFilter,
              options: "i",
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$sellingPrice" },
              regex: globalFilter,
              options: "i",
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$stock" },
              regex: globalFilter,
              options: "i",
            },
          },
        },
      ];
    }

    // -----------------------------
    //  MAIN DATA PIPELINE
    // -----------------------------
    // const pipeline = [
    //   { $match: baseMatch },

    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "product",
    //       foreignField: "_id",
    //       as: "productData",
    //     },
    //   },

    //   {
    //     $unwind: {
    //       path: "$productData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },

    //   ...(globalFilter ? [{ $match: lookupMatch }] : []),

    //   { $sort: sortQuery },
    //   { $skip: start },
    //   { $limit: size },

    //   {
    //     $project: {
    //       _id: 1,
    //       product: "$productData.name",
    //       color: 1,
    //       size: 1,
    //       gender: 1,
    //       sku: 1,
    //       stock: { $ifNull: ["$stock", 0] }, 
    //       mrp: 1,
    //       sellingPrice: 1,
    //       discountPercentage: 1,
    //       createdAt: 1,
    //       updatedAt: 1,
    //       deletedAt: 1,
    //     },
    //   },
    // ];
    const pipeline = [
  { $match: baseMatch },

  // PRODUCT
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "productData",
    },
  },
  { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },

  // MEDIA (FROM VARIANT)
  {
    $lookup: {
      from: "media",
      localField: "media",
      foreignField: "_id",
      as: "mediaData",
    },
  },

  // PICK FIRST IMAGE
  {
    $addFields: {
      image: {
        $ifNull: [
          { $arrayElemAt: ["$mediaData.secure_url", 0] },
          { $arrayElemAt: ["$mediaData.url", 0] },
        ],
      },
    },
  },

  ...(globalFilter ? [{ $match: lookupMatch }] : []),

  { $sort: sortQuery },
  { $skip: start },
  { $limit: size },

  {
    $project: {
      _id: 1,
      product: "$productData.name",
      image: 1,                
      color: 1,
      size: 1,
      gender: 1,
      sku: 1,
      stock: { $ifNull: ["$stock", 0] },
      mrp: 1,
      sellingPrice: 1,
      discountPercentage: 1,
      createdAt: 1,
    },
  },
];

    const data = await ProductVariantModel.aggregate(pipeline);

    // -----------------------------
    //  COUNT PIPELINE (CORRECT)
    // -----------------------------
    const countPipeline = [
      { $match: baseMatch },

      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },

      { $unwind: "$productData" },

      ...(globalFilter ? [{ $match: lookupMatch }] : []),

      { $count: "total" },
    ];

    const countResult = await ProductVariantModel.aggregate(countPipeline);
    const totalRowCount = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data,
      meta: { totalRowCount },
    });

  } catch (error) {
    console.error("PRODUCT VARIANT ERROR:", error);
    return catchError(error);
  }
}


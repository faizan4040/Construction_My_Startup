import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReviewModel from "@/models/Review.model"
import mongoose from "mongoose"

export async function GET(request) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")
    const page = parseInt(searchParams.get("page")) || 1
    const limit = 10
    const skip = (page - 1) * limit

    if (!productId) {
      return response(false, 400, "Product ID is required")
    }


    const matchQuery = {
      deletedAt: null,
      product: new mongoose.Types.ObjectId(productId),
    }

    const aggregation = [
      { $match: matchQuery },

      { $sort: { createdAt: -1 } },

      { $skip: skip },

      { $limit: limit + 1 },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },

      {
        $unwind: {
          path: "$userData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          rating: 1,
          title: 1,
          review: 1,
          createdAt: 1,
          reviewedBy: "$userData.name",
          avatar: "$userData.avatar",
        },
      },
    ]

    let reviews = await ReviewModel.aggregate(aggregation)
    const totalReviews = await ReviewModel.countDocuments(matchQuery)

    let nextPage = null
    if (reviews.length > limit) {
      reviews.pop()
      nextPage = page + 1
    }

    return response(true, 200, "Review data fetched.", {
      reviews,
      totalReviews,
      nextPage,
    })
  } catch (error) {
    return catchError(error)
  }
}

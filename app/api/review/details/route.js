import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ReviewModel from "@/models/Review.model";
import mongoose from "mongoose";

export async function GET(request) {
    try{
        
        await connectDB()
        const searchParams = request.nextUrl.searchParams
        const productId = searchParams.get('productId')
        if(!productId){
            return response(false, 404, 'Product is missing')
        }

        const reviews = await ReviewModel.aggregate([
            { $match: {product: new mongoose.Types.ObjectId(productId), deletedAt: null} },
            { $group: {_id: '$rating', count: { $sum: 1 } } },
            { $sort: {_id: 1 } }
        ])

        // total reviews
                const totalReviews = reviews.reduce((sum, r) => sum + r.count, 0)

                // average rating (always number)
                const averageRating =
                totalReviews > 0
                    ? Number(
                        (
                        reviews.reduce((sum, r) => sum + r._id * r.count, 0) /
                        totalReviews
                        ).toFixed(1)
                    )
                    : 0

                // rating breakdown { 5: 10, 4: 2 }
                const ratingBreakdown = reviews.reduce((acc, r) => {
                acc[r._id] = r.count
                return acc
                }, {})

                // percentage breakdown (safe)
                const ratingPercentage = reviews.reduce((acc, r) => {
                acc[r._id] =
                    totalReviews > 0 ? Math.round((r.count / totalReviews) * 100) : 0
                return acc
                }, {})


        return response(true, 200, "Review details", {
            totalReviews,
            averageRating,
            rating: ratingBreakdown,
            percentage: ratingPercentage,
            })
    }
    catch (error) {
      return catchError(error)
    }
}
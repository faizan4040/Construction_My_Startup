import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperfunction";
import connectDB from "@/lib/databaseConnection";
import ReviewModel from "@/models/Review.model";

export async function GET() {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 401, "Unauthorized");
    }

    await connectDB();

    const latestReview = await ReviewModel.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "product",
        select: "name media",
        populate: {
          path: "media",
          select: "secure_url",
        },
      })
      .lean();

    return response(true, 200, "Latest reviews found", latestReview);
  } catch (error) {
    return catchError(error);
  }
}

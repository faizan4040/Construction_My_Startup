import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET() {
  try {
    await connectDB();

    const genders = await ProductVariantModel.aggregate([
      { $match: { deletedAt: null } },  
      { $group: { _id: "$gender" } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, gender: "$_id" } },
    ]);

    if (!genders.length) {
      return response(false, 404, "Gender not found");
    }

    return response(true, 200, "Gender found.", genders);
  } catch (error) {
    return catchError(error);
  }
}

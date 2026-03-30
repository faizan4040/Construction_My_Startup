import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import WarehouseModel from "@/models/Warehouse.model";
import { isValidObjectId } from "mongoose";

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const getParams = await params;
    const { id } = getParams;

    if (!isValidObjectId(id)) {
      return response(false, 400, "Invalid warehouse ID.");
    }

    const warehouse = await WarehouseModel.findOne({
      _id: id,
      deletedAt: null,
    }).lean();

    if (!warehouse) {
      return response(false, 404, "Warehouse not found.");
    }

    return response(true, 200, "Warehouse found.", warehouse);
  } catch (error) {
    return catchError(error);
  }
}
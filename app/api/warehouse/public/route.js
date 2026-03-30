import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import WarehouseModel from "@/models/Warehouse.model";

export async function GET(request) {
  try {
    await connectDB();

    const warehouses = await WarehouseModel.find({
      deletedAt: null,
      status: "active",
    })
      .select("name location city state phone email manager capacity currentStock status slug")
      .lean();

    if (!warehouses || warehouses.length === 0) {
      return response(true, 200, "No warehouses found.", []);
    }

    return response(true, 200, "Warehouses retrieved successfully.", warehouses);
  } catch (error) {
    return catchError(error);
  }
}
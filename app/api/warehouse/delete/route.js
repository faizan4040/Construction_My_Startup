import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import WarehouseModel from "@/models/Warehouse.model";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();
    const payload = await request.json();

    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list.");
    }

    const warehouses = await WarehouseModel.find({
      _id: { $in: ids },
    }).lean();

    if (!warehouses.length) {
      return response(false, 404, "Data not found.");
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return response(
        false,
        400,
        "Invalid delete operation. Delete type should be SD or RSD."
      );
    }

    if (deleteType === "SD") {
      // Soft delete
      await WarehouseModel.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: new Date().toISOString() } }
      );
    } else {
      // Restore
      await WarehouseModel.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: null } }
      );
    }

    return response(
      true,
      200,
      deleteType === "SD"
        ? "Warehouse(s) moved to trash."
        : "Warehouse(s) restored."
    );
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();
    const payload = await request.json();

    const ids = payload.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list.");
    }

    const warehouses = await WarehouseModel.find({
      _id: { $in: ids },
    }).lean();

    if (!warehouses.length) {
      return response(false, 404, "Data not found.");
    }

    await WarehouseModel.deleteMany({ _id: { $in: ids } });

    return response(true, 200, "Warehouse(s) permanently deleted.");
  } catch (error) {
    return catchError(error);
  }
}
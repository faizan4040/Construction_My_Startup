import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { updateWarehouseSchema } from "@/lib/zodSchema";
import WarehouseModel from "@/models/Warehouse.model";
import { isValidObjectId } from "mongoose";
import slugify from "slugify";

// GET handler to fetch warehouse
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
    });

    if (!warehouse) {
      return response(false, 404, "Warehouse not found.");
    }

    return response(true, 200, "Warehouse fetched successfully.", warehouse);
  } catch (error) {
    return catchError(error);
  }
}

// PUT handler to update warehouse
export async function PUT(request, { params }) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();
    const payload = await request.json();

    const validate = updateWarehouseSchema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields.", validate.error);
    }

    const getParams = await params;
    const { id } = getParams;

    if (!isValidObjectId(id)) {
      return response(false, 400, "Invalid warehouse ID.");
    }

    const warehouse = await WarehouseModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!warehouse) {
      return response(false, 404, "Warehouse not found.");
    }

    const {
      name,
      location,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      manager,
      capacity,
      status,
    } = validate.data;

    // Check if new name is already used by another warehouse
    if (name !== warehouse.name) {
      const existingWarehouse = await WarehouseModel.findOne({
        name: name,
        _id: { $ne: id },
        deletedAt: null,
      });

      if (existingWarehouse) {
        return response(false, 400, "Warehouse with this name already exists.");
      }
    }

    warehouse.name = name;
    warehouse.location = location;
    warehouse.address = address;
    warehouse.city = city;
    warehouse.state = state;
    warehouse.zipCode = zipCode;
    warehouse.country = country;
    warehouse.phone = phone;
    warehouse.email = email;
    warehouse.manager = manager;
    warehouse.capacity = capacity;
    warehouse.status = status;
    warehouse.slug = slugify(name).toLowerCase();

    await warehouse.save();

    return response(true, 200, "Warehouse updated successfully.", warehouse);
  } catch (error) {
    return catchError(error);
  }
}
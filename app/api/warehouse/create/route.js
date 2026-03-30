import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { createWarehouseSchema } from "@/lib/zodSchema";
import WarehouseModel from "@/models/Warehouse.model";
import slugify from "slugify";

export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();
    const payload = await request.json();

    const validate = createWarehouseSchema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields.", validate.error);
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

    // Check if warehouse with same name exists
    const existingWarehouse = await WarehouseModel.findOne({
      name: name,
      deletedAt: null,
    });

    if (existingWarehouse) {
      return response(false, 400, "Warehouse with this name already exists.");
    }

    // Generate slug from name
    const slug = slugify(name).toLowerCase();

    const newWarehouse = new WarehouseModel({
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
      slug,
    });

    await newWarehouse.save();

    return response(true, 201, "Warehouse created successfully.", newWarehouse);
  } catch (error) {
    return catchError(error);
  }
}
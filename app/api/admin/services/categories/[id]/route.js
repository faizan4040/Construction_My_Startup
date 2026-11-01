import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceCategory from "@/models/ServiceCategory.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j, parseCategoryBody } from "@/lib/serviceHelpers";

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const body = await req.json();
    const p = parseCategoryBody(body);
    if (p.error) return j({ message: p.error }, 400);
    try {
      // slug stays the same so old links keep working
      const c = await ServiceCategory.findByIdAndUpdate(
        id,
        { $set: { name: p.data.name, icon: p.data.icon, image: p.data.image, isActive: body.isActive !== false } },
        { returnDocument: "after" }
      );
      return c ? j({ category: c }) : j({ message: "not found" }, 404);
    } catch (e) {
      if (e.code === 11000) return j({ message: "A category with this name already exists" }, 409);
      throw e;
    }
  } catch (e) {
    console.error("admin category update error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    if (await ServiceProvider.exists({ category: id, deletedAt: null }))
      return j({ message: "This category still has labour. Move or delete them first." }, 409);
    await ServiceCategory.deleteOne({ _id: id });
    return j({ success: true });
  } catch (e) {
    console.error("admin category delete error", e);
    return j({ message: "something went wrong" }, 500);
  }
}
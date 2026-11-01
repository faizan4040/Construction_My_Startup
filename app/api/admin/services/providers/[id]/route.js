import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceProvider from "@/models/ServiceProvider.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, parseProviderBody, resolveCategory } from "@/lib/serviceHelpers";
import { ACTIVE } from "@/lib/serviceConfig";

const guard = async (context) => {
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return { res: j({ message: "invalid" }, 400) };
  await connectDb();
  if (!(await isAuthenticated("admin")).isAuth) return { res: j({ message: "unauthorized" }, 401) };
  return { id };
};

export async function PUT(req, context) {
  try {
    const g = await guard(context);
    if (g.res) return g.res;
    const body = await req.json();
    const p = parseProviderBody(body);
    if (p.error) return j({ message: p.error }, 400);
    const c = await resolveCategory(body);
    if (c.error) return j({ message: c.error }, 400);
    const doc = await ServiceProvider.findOneAndUpdate(
      { _id: g.id, deletedAt: null }, { $set: { ...p.data, category: c.id } }, { returnDocument: "after" }
    );
    return doc ? j({ provider: doc }) : j({ message: "not found" }, 404);
  } catch (e) {
    console.error("admin provider update error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

// quick active / inactive switch from the table
export async function PATCH(req, context) {
  try {
    const g = await guard(context);
    if (g.res) return g.res;
    const { isActive } = await req.json();
    const doc = await ServiceProvider.findOneAndUpdate(
      { _id: g.id, deletedAt: null }, { $set: { isActive: !!isActive } }, { returnDocument: "after" }
    );
    return doc ? j({ provider: doc }) : j({ message: "not found" }, 404);
  } catch (e) {
    console.error("admin provider toggle error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

// soft delete: old bookings keep their snapshot
export async function DELETE(req, context) {
  try {
    const g = await guard(context);
    if (g.res) return g.res;
    if (await ServiceBooking.exists({ provider: g.id, status: { $in: ACTIVE } }))
      return j({ message: "This labour has open bookings. Finish or cancel them first." }, 409);
    const doc = await ServiceProvider.findOneAndUpdate(
      { _id: g.id, deletedAt: null }, { $set: { deletedAt: new Date(), isActive: false } }
    );
    return doc ? j({ success: true }) : j({ message: "not found" }, 404);
  } catch (e) {
    console.error("admin provider delete error", e);
    return j({ message: "something went wrong" }, 500);
  }
}
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, userBooking } from "@/lib/serviceHelpers";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "not found" }, 404);
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);
    const b = await ServiceBooking.findOne({ _id: id, user: s.userId }).lean(); // only the owner
    if (!b) return j({ message: "not found" }, 404);
    return j({ booking: userBooking(b) });
  } catch (e) {
    console.error("service booking get error", e);
    return j({ message: "something went wrong" }, 500);
  }
}



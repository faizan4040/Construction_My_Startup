import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j, str, adminBooking } from "@/lib/serviceHelpers";
import { pingAdmins, refundService } from "@/lib/serviceFinance";

const FLOW = {
  confirm: { from: ["pending"], to: "confirmed" },
  assign: { from: ["pending", "confirmed", "assigned"], to: "assigned" },
  start: { from: ["assigned"], to: "in_progress" },
  complete: { from: ["assigned", "in_progress"], to: "completed" },
  cancel: { from: ["pending", "confirmed", "assigned"], to: "cancelled" },
};

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);

    const body = await req.json();
    const now = new Date();

    if (body.action === "seen") {
      await ServiceBooking.updateOne({ _id: id }, { $set: { adminSeen: true } });
      return j({ success: true });
    }
    const step = FLOW[body.action];
    if (!step) return j({ message: "invalid action" }, 400);

    const set = { status: step.to, adminSeen: true };
    const filter = { _id: id, status: { $in: step.from } };

    if (body.action === "assign") {
      const name = str(body.assignedName, 60);
      const phone = str(body.assignedPhone, 10);
      if (name.length < 2) return j({ message: "Enter the professional's name" }, 400);
      if (phone && !/^[6-9]\d{9}$/.test(phone)) return j({ message: "Enter a valid 10 digit mobile number" }, 400);
      Object.assign(set, { assignedName: name, assignedPhone: phone, adminNote: str(body.adminNote, 300) });
    }
    if (body.action === "confirm") set.confirmedAt = now;
    if (body.action === "complete") {
      // an online booking must be paid, a cash booking is collected right now
      filter.paymentStatus = { $in: ["paid", "cod"] };
      set.completedAt = now;
      set.paymentStatus = "paid";
      set.paidAt = now;
    }
    if (body.action === "cancel") Object.assign(set, { cancelledBy: "admin", cancelReason: str(body.reason, 100) || "cancelled_by_admin" });

    const b = await ServiceBooking.findOneAndUpdate(
      filter,
      { $set: set, $push: { history: { status: step.to, at: now, byRole: "admin", note: body.action } } },
      { returnDocument: "after" }
    ).lean();
    if (!b) return j({ message: "This action is not allowed for the current status" }, 409);

    if (body.action === "complete") await ServiceProvider.updateOne({ _id: b.provider }, { $inc: { jobsDone: 1 } });
    // if (body.action === "cancel" && b.paymentMethod === "online") await refundService({ ...b, paymentStatus: "paid" }.paymentStatus === "paid" ? b : b);
    if (body.action === "cancel") await refundService(b);
    await pingAdmins(b._id, step.to);
    return j({ booking: adminBooking(b) });
  } catch (e) {
    console.error("admin service booking action error", e);
    return j({ message: "something went wrong" }, 500);
  }
}






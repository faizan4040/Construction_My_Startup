import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import Labour from "@/models/Labour.model";
import User from "@/models/User.model";
import { j, str, adminBooking } from "@/lib/serviceHelpers";
import { refundService } from "@/lib/serviceFinance";
import { settleServiceBooking } from "@/lib/finance";
import { calcServiceSplit } from "@/lib/commission";
import { pushServiceUpdate, offerToLabour, assignableLabours } from "@/lib/labourJobs";
import { emitToUser } from "@/lib/socketEmit";

const FLOW = {
  confirm: { from: ["pending"], to: "confirmed" },
  assign: { from: ["pending", "confirmed", "assigned"], to: "assigned" },          // outside professional (name + phone)
  assign_labour: { from: ["pending", "confirmed", "assigned"], to: "assigned" },   // registered labour account
  start: { from: ["assigned"], to: "in_progress" },
  complete: { from: ["assigned", "in_progress"], to: "completed" },
  cancel: { from: ["pending", "confirmed", "assigned"], to: "cancelled" },
};

// GET -> labours the admin can assign this booking to
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const b = await ServiceBooking.findById(id).lean();
    if (!b) return j({ message: "not found" }, 404);
    const sp = new URL(req.url).searchParams;
    const labours = await assignableLabours({ q: sp.get("q") || "", category: sp.get("category") || "" });
    const declined = new Set((b.declinedBy || []).map(String));
    const split = await calcServiceSplit(b);
    return j({
      booking: adminBooking(b),
      split,
      labours: labours.map((l) => ({ ...l, declined: declined.has(l.userId) })),
    });
  } catch (e) {
    console.error("assignable labours error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

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

    const before = await ServiceBooking.findById(id).select("assignedLabour status").lean();
    if (!before) return j({ message: "not found" }, 404);

    const set = { status: step.to, adminSeen: true };
    const unset = {};
    const filter = { _id: id, status: { $in: step.from } };
    let labour = null;

    if (body.action === "assign") {
      const name = str(body.assignedName, 60);
      const phone = str(body.assignedPhone, 10);
      if (name.length < 2) return j({ message: "Enter the professional's name" }, 400);
      if (phone && !/^[6-9]\d{9}$/.test(phone)) return j({ message: "Enter a valid 10 digit mobile number" }, 400);
      Object.assign(set, { assignedName: name, assignedPhone: phone, adminNote: str(body.adminNote, 300),
        assignedLabour: null, labourProfile: null, assignStatus: "" });
      filter.status = { $in: ["pending", "confirmed", "assigned"] };
    }

    if (body.action === "assign_labour") {
      if (!mongoose.isValidObjectId(body.labourId)) return j({ message: "Choose a labour" }, 400);
      const u = await User.findOne({ _id: body.labourId, role: "laber", partnerStatus: "approved", isBlocked: { $ne: true }, deletedAt: null })
        .select("_id").lean();
      const p = u && (await Labour.findOne({ owner: u._id, status: "approved", isActive: true }).select("fullName phone").lean());
      if (!p) return j({ message: "This labour is not available (blocked, removed or not approved)" }, 409);
      labour = { userId: String(u._id) };
      Object.assign(set, {
        assignedLabour: u._id, labourProfile: p._id, assignStatus: "offered", offeredAt: now,
        assignedName: p.fullName, assignedPhone: p.phone, adminNote: str(body.adminNote, 300),
      });
      // a job already started by someone else cannot be moved
      filter.status = { $in: ["pending", "confirmed", "assigned"] };
    }

    if (body.action === "confirm") set.confirmedAt = now;
    if (body.action === "start") set.startedAt = now;

    if (body.action === "complete") {
      // an online booking must be paid, a cash booking is collected right now
      filter.paymentStatus = { $in: ["paid", "cod"] };
      const cur = await ServiceBooking.findById(id).lean();
      const split = await calcServiceSplit(cur);
      Object.assign(set, {
        completedAt: now, paymentStatus: "paid", paidAt: cur.paidAt || now,
        commissionRate: split.percent, adminCommission: split.commission, labourAmount: split.labourAmount,
        cashCollectedBy: cur.paymentMethod === "cash" ? (cur.assignedLabour ? "labour" : "admin") : "",
      });
    }

    if (body.action === "cancel") {
      Object.assign(set, { cancelledBy: "admin", cancelReason: str(body.reason, 100) || "rejected_by_admin" });
    }

    const b = await ServiceBooking.findOneAndUpdate(
      filter,
      {
        $set: set,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
        $push: { history: { status: step.to, at: now, byRole: "admin", note: body.action } },
      },
      { returnDocument: "after" }
    ).lean();
    if (!b) return j({ message: "This action is not allowed for the current status" }, 409);

    // the previous labour lost the job (re-assigned or cancelled)
    const prev = before.assignedLabour ? String(before.assignedLabour) : "";
    if (prev && prev !== String(b.assignedLabour || "")) {
      await emitToUser(prev, "service-job-update", { kind: "service", bookingId: String(b._id), status: "unassigned" });
    }

    if (body.action === "assign_labour") await offerToLabour(b, labour);
    if (body.action === "complete") {
      await settleServiceBooking(b);
      await ServiceProvider.updateOne({ _id: b.provider }, { $inc: { jobsDone: 1 } });
      if (b.labourProfile) await Labour.updateOne({ _id: b.labourProfile }, { $inc: { completedJobs: 1 } });
    }
    if (body.action === "cancel") await refundService(b);

    await pushServiceUpdate(b, body.action === "assign_labour" ? "offered" : step.to);
    return j({ booking: adminBooking(b) });
  } catch (e) {
    console.error("admin service booking action error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import Labour from "@/models/Labour.model";
import { calcServiceSplit } from "@/lib/commission";
import { settleServiceBooking } from "@/lib/finance";
import { labourServiceJob, pushServiceUpdate } from "@/lib/labourJobs";

const bad = (message, status = 400) => NextResponse.json({ message }, { status });

/*
  accept   offered  -> accepted          (status stays "assigned")
  decline  offered  -> back to admin     (status "confirmed", labour removed)
  start    accepted -> status in_progress
  complete in_progress -> completed, money split frozen + ledger entries
*/
export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return bad("invalid");
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return bad("unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const now = new Date();
    const mine = { _id: id, assignedLabour: s.userId };
    const hist = (status, note) => ({ $push: { history: { status, at: now, byRole: "labour", note } } });
    let b;

    if (action === "accept") {
      b = await ServiceBooking.findOneAndUpdate(
        { ...mine, status: "assigned", assignStatus: "offered" },
        { $set: { assignStatus: "accepted", labourAcceptedAt: now }, ...hist("labour_accepted") },
        { returnDocument: "after" }
      ).lean();
      if (!b) return bad("This job is no longer offered to you", 409);
    } else if (action === "decline") {
      b = await ServiceBooking.findOneAndUpdate(
        { ...mine, status: "assigned", assignStatus: { $in: ["offered", "accepted"] } },
        {
          $set: { status: "confirmed", assignStatus: "declined", assignedLabour: null, labourProfile: null,
            assignedName: "", assignedPhone: "", adminSeen: false },
          $addToSet: { declinedBy: s.userId },
          ...hist("labour_declined", String(body.reason || "").slice(0, 100)),
        },
        { returnDocument: "after" }
      ).lean();
      if (!b) return bad("This job can no longer be declined", 409);
      await pushServiceUpdate({ ...b, assignedLabour: s.userId }, "labour_declined");
      return NextResponse.json({ success: true });
    } else if (action === "start") {
      b = await ServiceBooking.findOneAndUpdate(
        { ...mine, status: "assigned", assignStatus: "accepted" },
        { $set: { status: "in_progress", startedAt: now }, ...hist("in_progress") },
        { returnDocument: "after" }
      ).lean();
      if (!b) return bad("Accept the job first", 409);
    } else if (action === "complete") {
      const cur = await ServiceBooking.findOne({ ...mine, status: "in_progress" }).lean();
      if (!cur) return bad("Start the work first", 409);
      if (cur.paymentMethod === "cash" && body.cashReceived !== true)
        return bad(`Confirm that you collected ₹${cur.total} cash from the customer`);
      if (cur.paymentMethod === "online" && cur.paymentStatus !== "paid")
        return bad("Online payment is not confirmed yet", 409);

      const split = await calcServiceSplit(cur);
      b = await ServiceBooking.findOneAndUpdate(
        { ...mine, status: "in_progress" },
        {
          $set: {
            status: "completed", completedAt: now, paymentStatus: "paid", paidAt: cur.paidAt || now,
            commissionRate: split.percent, adminCommission: split.commission, labourAmount: split.labourAmount,
            cashCollectedBy: cur.paymentMethod === "cash" ? "labour" : "",
          },
          ...hist("completed", cur.paymentMethod === "cash" ? "cash_collected" : "online"),
        },
        { returnDocument: "after" }
      ).lean();
      if (!b) return bad("Already completed", 409);
      await settleServiceBooking(b);
      await Promise.all([
        ServiceProvider.updateOne({ _id: b.provider }, { $inc: { jobsDone: 1 } }),
        b.labourProfile ? Labour.updateOne({ _id: b.labourProfile }, { $inc: { completedJobs: 1 } }) : null,
      ]);
    } else {
      return bad("invalid action");
    }

    await pushServiceUpdate(b, action === "accept" ? "labour_accepted" : b.status);
    return NextResponse.json({ success: true, job: labourServiceJob(b) });
  } catch (error) {
    console.error("partner service job action error", error);
    return bad("something went wrong", 500);
  }
}

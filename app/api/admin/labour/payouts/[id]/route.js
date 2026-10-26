import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import { executePayout, reversePayout } from "@/lib/payouts";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { action, utr } = await req.json();
    const now = new Date();

    if (action === "approve") {
      const p = await Payout.findOneAndUpdate({ _id: id, status: "requested" },
        { $set: { status: "approved", reviewedBy: s.userId, reviewedAt: now } }, { returnDocument: "after" });
      if (!p) return NextResponse.json({ message: "not pending" }, { status: 409 });
      await PayoutAccount.updateOne({ user: p.owner }, { $set: { status: "verified" } });
      const r = await executePayout(p._id); // manual mode until RAZORPAYX_ENABLED=true
      return NextResponse.json({ success: true, ...r });
    }

    if (action === "reject") {
      const p = await Payout.findOneAndUpdate({ _id: id, status: { $in: ["requested", "approved"] } },
        { $set: { status: "rejected", reviewedBy: s.userId, reviewedAt: now } }, { returnDocument: "after" });
      if (!p) return NextResponse.json({ message: "cannot reject" }, { status: 409 });
      await reversePayout(p);
      return NextResponse.json({ success: true });
    }

    if (action === "mark_paid") {
      const ref = String(utr || "").trim().slice(0, 40);
      if (ref.length < 6) return NextResponse.json({ message: "enter the bank UTR / reference" }, { status: 400 });
      const p = await Payout.findOneAndUpdate({ _id: id, status: "approved", method: "manual" },
        { $set: { status: "paid", utr: ref, processedAt: now } }, { returnDocument: "after" });
      if (!p) return NextResponse.json({ message: "cannot mark paid" }, { status: 409 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "invalid action" }, { status: 400 });
  } catch (error) {
    console.error("admin payout action error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
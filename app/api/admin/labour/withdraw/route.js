import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import Ledger from "@/models/Ledger.model";
import { getPlatformSummary, MIN_PAYOUT } from "@/lib/finance";
import { executePayout } from "@/lib/payouts";

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

export async function POST(req) {
  const session = await mongoose.startSession();
  try {
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const amount = Math.floor(Number((await req.json()).amount));
    if (!Number.isFinite(amount) || amount < MIN_PAYOUT) throw new HttpError(400, `minimum is ₹${MIN_PAYOUT}`);

    let payout;
    await session.withTransaction(async () => {
      const acc = await PayoutAccount.findOneAndUpdate({ user: s.userId }, { $inc: { version: 1 } }, { session, returnDocument: "after" });
      if (!acc) throw new HttpError(400, "add your bank account first");
      const sum = await getPlatformSummary(session);
      if (amount > sum.available) throw new HttpError(409, `only ₹${Math.max(0, sum.available)} is available`);

      [payout] = await Payout.create([{
        ownerType: "admin", owner: s.userId, amount, status: "approved", reviewedBy: s.userId, reviewedAt: new Date(),
        account: { holderName: acc.holderName, last4: acc.last4, ifsc: acc.ifsc, upiId: acc.upiId },
      }], { session });
      await Ledger.create([{ ownerType: "platform", payout: payout._id, type: "platform_withdrawal", amount: -amount }], { session });
    });

    const r = await executePayout(payout._id); // manual until RazorpayX is on
    return NextResponse.json({ success: true, ...r });
  } catch (error) {
    if (error instanceof HttpError) return NextResponse.json({ message: error.message }, { status: error.status });
    console.error("admin withdraw error", error);
    return NextResponse.json({ message: "could not withdraw" }, { status: 500 });
  } finally {
    session.endSession();
  }
}
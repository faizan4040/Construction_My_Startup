import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import Ledger from "@/models/Ledger.model";
import { getLabourWallet, MIN_PAYOUT } from "@/lib/finance";
import { executePayout } from "@/lib/payouts";
import { emitToAdmins } from "@/lib/socketEmit";

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const AUTO_LIMIT = Number(process.env.PAYOUT_AUTO_LIMIT ?? 5000);

export async function POST(req) {
  const session = await mongoose.startSession();
  try {
    await connectDb();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const amount = Math.floor(Number((await req.json()).amount));
    if (!Number.isFinite(amount) || amount < MIN_PAYOUT) throw new HttpError(400, `minimum withdrawal is ₹${MIN_PAYOUT}`);

    let payout, acc;
    await session.withTransaction(async () => {
      acc = await PayoutAccount.findOneAndUpdate({ user: s.userId }, { $inc: { version: 1 } }, { session, returnDocument: "after" });
      if (!acc) throw new HttpError(400, "add your bank account first");
      const w = await getLabourWallet(s.userId, session);
      if (w.dues > 0) throw new HttpError(409, `clear your cash dues of ₹${w.dues} first`);
      if (amount > w.available) throw new HttpError(409, `only ₹${Math.max(0, w.available)} is available`);

      [payout] = await Payout.create([{
        ownerType: "labour", owner: s.userId, amount,
        account: { holderName: acc.holderName, last4: acc.last4, ifsc: acc.ifsc, upiId: acc.upiId },
      }], { session });
      await Ledger.create([{ ownerType: "labour", owner: s.userId, payout: payout._id, type: "payout_debit", amount: -amount, availableAt: new Date() }], { session });
    });

    if (process.env.PAYOUT_AUTO_APPROVE === "true" && acc.status === "verified" && amount <= AUTO_LIMIT) {
      await Payout.updateOne({ _id: payout._id, status: "requested" }, { $set: { status: "approved", reviewedAt: new Date() } });
      await executePayout(payout._id);
    }
    await emitToAdmins("admin-booking-update", { status: "payout_requested" });
    return NextResponse.json({ success: true, payoutId: payout._id });
  } catch (error) {
    if (error instanceof HttpError) return NextResponse.json({ message: error.message }, { status: error.status });
    console.error("payout request error", error);
    return NextResponse.json({ message: "could not create withdrawal, try again" }, { status: 500 });
  } finally {
    session.endSession();
  }
}
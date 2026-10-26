import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Ledger from "@/models/Ledger.model";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import { getLabourWallet, MIN_PAYOUT, MAX_CASH_DUES } from "@/lib/finance";

export async function GET() {
  try {
    await connectDb();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const [wallet, entries, payouts, account] = await Promise.all([
      getLabourWallet(s.userId),
      Ledger.find({ ownerType: "labour", owner: s.userId }).sort({ createdAt: -1 }).limit(25)
        .select("type amount availableAt booking createdAt").lean(),
      Payout.find({ owner: s.userId }).sort({ createdAt: -1 }).limit(10)
        .select("amount status utr failureReason createdAt").lean(),
      PayoutAccount.findOne({ user: s.userId }).select("holderName last4 ifsc upiId status").lean(),
    ]);
    return NextResponse.json({ ...wallet, minPayout: MIN_PAYOUT, maxDues: MAX_CASH_DUES, entries, payouts, account },
      { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("wallet error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
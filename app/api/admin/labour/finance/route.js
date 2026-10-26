import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import "@/models/User.model";
import { getPlatformSummary, getLabourPayable } from "@/lib/finance";

export async function GET() {
  try {
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const [platform, labour, payouts, account] = await Promise.all([
      getPlatformSummary(),
      getLabourPayable(),
      Payout.find().sort({ createdAt: -1 }).limit(50).populate("owner", "name").lean(),
      PayoutAccount.findOne({ user: s.userId }).select("holderName last4 ifsc upiId status").lean(),
    ]);

    return NextResponse.json({
      platform, labour, account,
      razorpayX: process.env.RAZORPAYX_ENABLED === "true",
      payouts: payouts.map((p) => ({
        _id: String(p._id), ownerType: p.ownerType, ownerName: p.owner?.name || "—", amount: p.amount,
        status: p.status, method: p.method, utr: p.utr || "", failureReason: p.failureReason || "",
        account: p.account, createdAt: p.createdAt,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin finance error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Ledger from "@/models/Ledger.model";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import "@/models/Booking.model";
import "@/models/ServiceBooking.model";
import { getLabourWallet } from "@/lib/finance";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    await connectDb();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const [wallet, entries, payouts, account, settings] = await Promise.all([
      getLabourWallet(s.userId),
      Ledger.find({ ownerType: "labour", owner: s.userId }).sort({ createdAt: -1 }).limit(40)
        .select("type amount channel availableAt booking serviceBooking note createdAt")
        .populate("booking", "category fare")
        .populate("serviceBooking", "code categoryName total")
        .lean(),
      Payout.find({ owner: s.userId }).sort({ createdAt: -1 }).limit(15)
        .select("amount status utr failureReason createdAt processedAt account").lean(),
      PayoutAccount.findOne({ user: s.userId }).select("holderName last4 ifsc upiId status").lean(),
      getSettings(),
    ]);

    const now = Date.now();
    return NextResponse.json(
      {
        ...wallet,
        minPayout: settings.minPayout,
        maxDues: settings.maxCashDues,
        holdHours: settings.settlementHoldHours,
        commissionPercent: settings.labourCommissionPercent,
        account,
        payouts,
        entries: entries.map((e) => ({
          _id: String(e._id),
          type: e.type,
          amount: e.amount,
          channel: e.channel,
          createdAt: e.createdAt,
          onHold: e.amount > 0 && new Date(e.availableAt).getTime() > now,
          availableAt: e.availableAt,
          job: e.booking
            ? { kind: "live", label: e.booking.category, fare: e.booking.fare }
            : e.serviceBooking
              ? { kind: "service", label: `${e.serviceBooking.categoryName} #${e.serviceBooking.code}`, fare: e.serviceBooking.total }
              : null,
          note: e.note || "",
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("wallet error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import PayoutAccount from "@/models/PayoutAccount.model";
import { encrypt } from "@/lib/crypto";

const SAFE = "holderName last4 ifsc upiId status";

export async function GET() {
  await connectDb();
  const s = await isAuthenticated(["laber", "admin"]);
  if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  const account = await PayoutAccount.findOne({ user: s.userId }).select(SAFE).lean();
  return NextResponse.json({ account }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated(["laber", "admin"]);
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const b = await req.json();
    const holderName = String(b.holderName || "").trim();
    const accountNumber = String(b.accountNumber || "").replace(/\s/g, "");
    const ifsc = String(b.ifsc || "").trim().toUpperCase();
    const upiId = String(b.upiId || "").trim().toLowerCase();

    if (holderName.length < 3 || holderName.length > 60) return NextResponse.json({ message: "enter account holder name" }, { status: 400 });
    if (!/^\d{9,18}$/.test(accountNumber)) return NextResponse.json({ message: "invalid account number" }, { status: 400 });
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return NextResponse.json({ message: "invalid IFSC" }, { status: 400 });
    if (upiId && !/^[a-z0-9.\-_]{2,}@[a-z]{2,}$/.test(upiId)) return NextResponse.json({ message: "invalid UPI id" }, { status: 400 });

    // any change resets verification and the Razorpay fund account
    await PayoutAccount.updateOne(
      { user: s.userId },
      { $set: { holderName, accountNumberEnc: encrypt(accountNumber), last4: accountNumber.slice(-4), ifsc,
          upiId, status: "unverified", razorpayFundAccountId: null } },
      { upsert: true }
    );
    const account = await PayoutAccount.findOne({ user: s.userId }).select(SAFE).lean();
    return NextResponse.json({ account });
  } catch (error) {
    console.error("payout account error", error);
    return NextResponse.json({ message: "could not save" }, { status: 500 });
  }
}
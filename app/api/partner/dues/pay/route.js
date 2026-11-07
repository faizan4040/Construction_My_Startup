import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import { getLabourWallet } from "@/lib/finance";
import { rzp } from "@/lib/razorpay";

// Labour pays the platform commission they owe from cash jobs, via Razorpay.
// The amount always comes from the ledger, never from the browser (only a smaller part may be chosen).
export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const w = await getLabourWallet(s.userId);
    if (w.dues <= 0) return NextResponse.json({ message: "You have no dues to pay" }, { status: 409 });

    const asked = Math.floor(Number(body.amount));
    const amount = Number.isFinite(asked) && asked >= 1 && asked < w.dues ? asked : w.dues;

    const order = await rzp().orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `dues_${String(s.userId).slice(-8)}_${Date.now().toString(36)}`,
      notes: { kind: "labour_dues", labour: String(s.userId) },
    });
    return NextResponse.json({
      orderId: order.id, amount: amount * 100, currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, dues: w.dues,
    });
  } catch (error) {
    console.error("dues pay error", error?.error?.description || error.message);
    return NextResponse.json({ message: "Could not start the payment" }, { status: 500 });
  }
}

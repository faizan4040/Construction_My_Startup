import axios from "axios";
import Payout from "@/models/Payout.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import Ledger from "@/models/Ledger.model";
import User from "@/models/User.model";
import { decrypt } from "@/lib/crypto";

export async function reversePayout(p) {
  const labour = p.ownerType === "labour";
  await Ledger.updateOne(
    { payout: p._id, type: labour ? "payout_reversal" : "platform_withdrawal_reversal" },
    {
      $setOnInsert: {
        ownerType: labour ? "labour" : "platform",
        owner: labour ? p.owner : undefined,
        payout: p._id,
        type: labour ? "payout_reversal" : "platform_withdrawal_reversal",
        amount: p.amount,
        availableAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function failPayout(id, reason) {
  const p = await Payout.findOneAndUpdate(
    { _id: id, status: { $in: ["requested", "approved", "processing"] } },
    { $set: { status: "failed", failureReason: String(reason || "failed").slice(0, 300), processedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (p) await reversePayout(p);
}

const http = () =>
  axios.create({
    baseURL: "https://api.razorpay.com/v1",
    auth: { username: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, password: process.env.RAZORPAY_KEY_SECRET },
    timeout: 15000,
  });

// RazorpayX transfer. Does nothing (manual mode) until RAZORPAYX_ENABLED=true.
export async function executePayout(id) {
  if (process.env.RAZORPAYX_ENABLED !== "true") return { manual: true };
  const p = await Payout.findOneAndUpdate(
    { _id: id, status: "approved" },
    { $set: { status: "processing", method: "razorpayx" } },
    { returnDocument: "after" }
  );
  if (!p) return { skipped: true };

  try {
    const acc = await PayoutAccount.findOne({ user: p.owner }).select("+accountNumberEnc");
    const user = await User.findById(p.owner).select("name email phone").lean();
    const api = http();

    if (!acc.razorpayContactId) {
      const { data } = await api.post("/contacts", {
        name: user?.name || acc.holderName, email: user?.email, contact: user?.phone,
        type: p.ownerType === "admin" ? "employee" : "vendor", reference_id: String(p.owner),
      });
      acc.razorpayContactId = data.id;
    }
    if (!acc.razorpayFundAccountId) {
      const body = acc.accountNumberEnc
        ? { contact_id: acc.razorpayContactId, account_type: "bank_account",
            bank_account: { name: acc.holderName, ifsc: acc.ifsc, account_number: decrypt(acc.accountNumberEnc) } }
        : { contact_id: acc.razorpayContactId, account_type: "vpa", vpa: { address: acc.upiId } };
      const { data } = await api.post("/fund_accounts", body);
      acc.razorpayFundAccountId = data.id;
    }
    await acc.save();

    const { data } = await api.post(
      "/payouts",
      {
        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
        fund_account_id: acc.razorpayFundAccountId,
        amount: p.amount * 100,
        currency: "INR",
        mode: acc.accountNumberEnc ? "IMPS" : "UPI",
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: String(p._id),
        narration: "Constructezy",
      },
      { headers: { "X-Payout-Idempotency": String(p._id) } }
    );
    await Payout.updateOne({ _id: p._id }, { $set: { razorpayPayoutId: data.id } });
    return { ok: true };
  } catch (e) {
    await failPayout(p._id, e?.response?.data?.error?.description || e.message);
    return { failed: true };
  }
}
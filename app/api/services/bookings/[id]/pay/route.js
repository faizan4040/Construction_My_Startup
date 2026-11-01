import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, userBooking } from "@/lib/serviceHelpers";
import { rzp } from "@/lib/razorpay";
import { pingAdmins } from "@/lib/serviceFinance";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);

    const { method } = await req.json();
    const b = await ServiceBooking.findOne({ _id: id, user: s.userId, status: "pending_payment" }).lean();
    if (!b) return j({ message: "This booking can no longer be paid" }, 409);

    if (method === "cash") {
      const now = new Date();
      const u = await ServiceBooking.findOneAndUpdate(
        { _id: id, user: s.userId, status: "pending_payment", razorpayPaymentId: { $exists: false } },
        {
          $set: { paymentMethod: "cash", paymentStatus: "cod", status: "pending", adminSeen: false },
          $push: { history: { status: "cash_selected", at: now, byRole: "customer" } },
        },
        { returnDocument: "after" }
      ).lean();
      if (!u) return j({ message: "This booking can no longer be changed" }, 409);
      await pingAdmins(u._id, "new");
      return j({ booking: userBooking(u) });
    }

    if (method !== "online") return j({ message: "invalid payment method" }, 400);

    // the amount ALWAYS comes from the database, never from the browser
    let orderId = b.razorpayOrderId;
    if (!orderId) {
      const o = await rzp().orders.create({
        amount: b.total * 100, currency: "INR", receipt: `sv_${String(b._id).slice(-12)}`,
        notes: { serviceBooking: String(b._id), code: b.code },
      });
      const set = await ServiceBooking.updateOne(
        { _id: b._id, razorpayOrderId: { $exists: false } },
        { $set: { razorpayOrderId: o.id, paymentMethod: "online" } }
      );
      orderId = set.modifiedCount ? o.id : (await ServiceBooking.findById(b._id).select("razorpayOrderId").lean()).razorpayOrderId;
    }
    return j({
      orderId, amount: b.total * 100, currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, description: `${b.categoryName} · ${b.code}`,
    });
  } catch (e) {
    console.error("service pay error", e?.error?.description || e.message);
    return j({ message: "Could not start the payment" }, 500);
  }
}
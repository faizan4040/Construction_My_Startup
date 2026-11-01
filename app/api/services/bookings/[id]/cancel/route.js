import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, str } from "@/lib/serviceHelpers";
import { pingAdmins, refundService } from "@/lib/serviceFinance";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const reason = str(body.reason, 100) || "customer_cancelled";
    const now = new Date();
    // the customer can cancel until the professional is sent
    const b = await ServiceBooking.findOneAndUpdate(
      { _id: id, user: s.userId, status: { $in: ["pending_payment", "pending", "confirmed"] } },
      {
        $set: { status: "cancelled", cancelledBy: "customer", cancelReason: reason },
        $push: { history: { status: "cancelled", at: now, byRole: "customer", note: reason } },
      },
      { returnDocument: "after" }
    ).lean();
    if (!b) return j({ message: "This booking can no longer be cancelled" }, 409);

    if (b.paymentStatus === "paid") await refundService(b);
    await pingAdmins(b._id, "cancelled");
    return j({ success: true });
  } catch (e) {
    console.error("service cancel error", e);
    return j({ message: "something went wrong" }, 500);
  }
}
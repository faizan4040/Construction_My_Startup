import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import { refundBooking } from "@/lib/finance";

const CANCELLABLE = ["requested", "confirmed", "arrived"]; // before work starts

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();
    const session = await isAuthenticated();
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const reason = String(body.reason || "customer_cancelled").slice(0, 100);
    const now = new Date();

    const booking = await Booking.findOneAndUpdate(
      { _id: id, user: session.userId, bookingStatus: { $in: CANCELLABLE } },
      {
        $set: { bookingStatus: "cancelled", cancelledBy: "customer", cancellationReason: reason },
        $push: { history: { status: "cancelled", at: now, by: session.userId, byRole: "customer", note: reason } },
      },
      { returnDocument: "after" }
    ).lean();
    if (!booking) return NextResponse.json({ message: "this booking can no longer be cancelled" }, { status: 409 });

    if (booking.paymentStatus === "paid") await refundBooking(booking); // online money goes back

    const p = { bookingId: String(booking._id), status: "cancelled", by: "customer" };
    await Promise.all([
      emitToUser(booking.labour, "booking-cancelled", p),
      emitToUser(booking.labour, "booking-update", p),
      emitToAdmins("admin-booking-update", p),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("cancel booking error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}








// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import connectDB from "@/lib/databaseConnection";
// import { isAuthenticated } from "@/lib/authentication";
// import Booking from "@/models/Booking.model";
// import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

// // customer can cancel until the work has started
// const CANCELLABLE = ["requested", "confirmed", "arrived"];

// export async function POST(req, context) {
//   try {
//     const { id } = await context.params;
//     if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
//     await connectDB();

//     const session = await isAuthenticated();
//     if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

//     const now = new Date();
//     const booking = await Booking.findOneAndUpdate(
//       { _id: id, user: session.userId, bookingStatus: { $in: CANCELLABLE } },
//       {
//         $set: { bookingStatus: "cancelled", cancelledBy: "customer", cancellationReason: "customer_cancelled" },
//         $push: { history: { status: "cancelled", at: now, by: session.userId, byRole: "customer" } },
//       },
//       { new: true }
//     ).lean();

//     if (!booking) {
//       return NextResponse.json(
//         { message: "this booking can no longer be cancelled" },
//         { status: 409 }
//       );
//     }

//     await Promise.all([
//       emitToUser(booking.labour, "booking-cancelled", { bookingId: String(booking._id) }),
//       emitToAdmins("admin-booking-update", { bookingId: String(booking._id), status: "cancelled" }),
//     ]);

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("cancel booking error", error);
//     return NextResponse.json({ message: "something went wrong" }, { status: 500 });
//   }
// }
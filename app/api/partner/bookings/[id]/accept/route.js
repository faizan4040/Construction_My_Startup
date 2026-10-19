import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import { toCustomerBooking } from "@/lib/bookingSerializers";
import { getLabourPublic } from "@/lib/labourPublic";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const now = new Date();
    let booking;
    try {
      // ONE atomic step: only the owner, only if still requested, only if not expired
      booking = await Booking.findOneAndUpdate(
        { _id: id, labour: session.userId, bookingStatus: "requested", requestExpiresAt: { $gt: now } },
        {
          $set: { bookingStatus: "confirmed", acceptedAt: now },
          $push: { history: { status: "confirmed", at: now, by: session.userId, byRole: "labour" } },
        },
        { new: true }
      ).lean();
    } catch (e) {
      if (e.code === 11000)
        return NextResponse.json({ message: "you already have an active job" }, { status: 409 });
      throw e;
    }

    if (!booking) {
      return NextResponse.json(
        { message: "request is no longer available (expired, cancelled or already handled)" },
        { status: 409 }
      );
    }

    // customer sees the labour's profile name + photo (never the phone number)
    const labourUser = await User.findById(session.userId).select("name avatar").lean();
    const labour = await getLabourPublic(booking, labourUser);

    await Promise.all([
      emitToUser(booking.user, "accept-booking", {
        status: "confirmed",
        booking: toCustomerBooking(booking, labour),
      }),
      emitToAdmins("admin-booking-update", {
        bookingId: String(booking._id),
        status: "confirmed",
      }),
    ]);

    // other customers' pending requests to this (now busy) labour
    const others = await Booking.find({
      labour: booking.labour,
      bookingStatus: "requested",
      _id: { $ne: booking._id },
    })
      .select("user")
      .lean();

    if (others.length) {
      await Booking.updateMany(
        { _id: { $in: others.map((o) => o._id) }, bookingStatus: "requested" },
        {
          $set: { bookingStatus: "rejected", cancellationReason: "labour_busy", cancelledBy: "system" },
          $push: { history: { status: "rejected", at: now, byRole: "system", note: "labour_busy" } },
        }
      );
      await Promise.all([
        ...others.map((o) =>
          emitToUser(o.user, "reject-booking", { status: "rejected", reason: "busy" })
        ),
        // one ping is enough: the admin table just refetches
        emitToAdmins("admin-booking-update", {
          bookingId: String(others[0]._id),
          status: "rejected",
        }),
      ]);
    }

    return NextResponse.json({ success: true, bookingId: booking._id }, { status: 200 });
  } catch (error) {
    console.error("accept booking error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}







// import connectDB from "@/lib/databaseConnection";
// import { isAuthenticated } from "@/lib/authentication";
// import Booking from "@/models/Booking.model";
// import axios from "axios";
// import { NextResponse } from "next/server";

// export async function GET(req, context) {
//     try {
//         const { id } = await context.params;
//         await connectDB();

//         const session = await isAuthenticated("laber");
//         if (!session.isAuth) {
//             return NextResponse.json({ message: "unauthorized" }, { status: 401 });
//         }

//         const booking = await Booking.findById(id);

//         if (!booking || booking.bookingStatus !== "requested") {
//             return NextResponse.json({ message: "invalid" }, { status: 400 });
//         }

//         // ensure this booking actually belongs to the logged-in labour
//         if (booking.labour.toString() !== session.userId) {
//             return NextResponse.json({ message: "unauthorized" }, { status: 401 });
//         }

//         booking.bookingStatus = "awaiting_payment";
//         booking.paymentDeadline = new Date(Date.now() + 5 * 60 * 1000);
//         await booking.save();

//         // NOTE: adjust this if your socket server URL / endpoint differs
//         await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
//             event: "accept-booking",
//             userId: booking.user,
//             data: booking.bookingStatus,
//         });

//         return NextResponse.json({ success: true }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json(
//             { message: `accept booking error ${error}` },
//             { status: 500 }
//         );
//     }
// }
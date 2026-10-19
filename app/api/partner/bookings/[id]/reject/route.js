import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const now = new Date();
    // atomic: only the owner, only while still requested AND not expired
    const booking = await Booking.findOneAndUpdate(
      { _id: id, labour: session.userId, bookingStatus: "requested", requestExpiresAt: { $gt: now } },
      {
        $set: { bookingStatus: "rejected", cancelledBy: "labour" },
        $push: { history: { status: "rejected", at: now, by: session.userId, byRole: "labour" } },
      },
      { new: true }
    ).lean();

    if (!booking) {
      return NextResponse.json(
        { message: "request is no longer available (expired, cancelled or already handled)" },
        { status: 409 }
      );
    }

    await Promise.all([
      emitToUser(booking.user, "reject-booking", { status: "rejected" }),
      emitToAdmins("admin-booking-update", {
        bookingId: String(booking._id),
        status: "rejected",
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("reject booking error", error);
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

//         booking.bookingStatus = "rejected";
//         await booking.save();

//         // NOTE: adjust this if your socket server URL / endpoint differs
//         await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
//             event: "reject-booking",
//             userId: booking.user,
//             data: booking.bookingStatus,
//         });

//         return NextResponse.json({ success: true }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json(
//             { message: `reject booking error ${error}` },
//             { status: 500 }
//         );
//     }
// }
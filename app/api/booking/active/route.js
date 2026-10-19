import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import { ACTIVE_STATUSES } from "@/lib/bookingConfig";
import { toCustomerBooking } from "@/lib/bookingSerializers";

export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated();
    if (!session.isAuth) return NextResponse.json({ booking: null }, { status: 401 });

    await Booking.updateMany(
      { user: session.userId, bookingStatus: "requested", requestExpiresAt: { $lte: new Date() } },
      { $set: { bookingStatus: "expired", cancelledBy: "system" } }
    );

    const booking = await Booking.findOne({
      user: session.userId,
      bookingStatus: { $in: ACTIVE_STATUSES },
    }).lean();

    if (!booking) return NextResponse.json({ booking: null });

    const labour = await User.findById(booking.labour).select("name avatar").lean();
    return NextResponse.json({ booking: toCustomerBooking(booking, labour) });
  } catch (error) {
    console.error("get active booking error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}








// import connectDB from "@/lib/databaseConnection";
// import { isAuthenticated } from "@/lib/authentication";
// import Booking from "@/models/Booking.model";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//     try {
//         await connectDB();

//         const session = await isAuthenticated(); // no role restriction — any logged-in user
//         if (!session.isAuth) {
//             return NextResponse.json({ booking: null });
//         }

//         const booking = await Booking.findOne({
//             user: session.userId,
//             bookingStatus: { $in: ["requested", "awaiting_payment", "confirmed", "started"] },
//         });

//         if (!booking) {
//             return NextResponse.json({ booking: "idle" });
//         }

//         return NextResponse.json({ booking });
//     } catch (error) {
//         return NextResponse.json(
//             { message: `get active booking error ${error}` },
//             { status: 400 }
//         );
//     }
// }
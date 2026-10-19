import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Booking from "@/models/Booking.model";
import { toLabourRequest } from "@/lib/bookingSerializers";

export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("laber");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const partner = await User.findById(session.userId).select("location").lean();
    if (!partner) return NextResponse.json({ message: "partner not found" }, { status: 404 });

    const bookings = await Booking.find({
      labour: session.userId,
      bookingStatus: "requested",
      requestExpiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).limit(50).lean();

    const coords = partner.location?.coordinates;
    return NextResponse.json(bookings.map((b) => toLabourRequest(b, coords)), { status: 200 });
  } catch (error) {
    console.error("fetch pending req error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}










// import { NextResponse } from "next/server";
// import connectDB from "@/lib/databaseConnection";
// import { isAuthenticated } from "@/lib/authentication";
// import User from "@/models/User.model";
// import Booking from "@/models/Booking.model";

// export async function GET(req) {
//   try {
//     await connectDB();

//     const session = await isAuthenticated("laber");
//     if (!session.isAuth) {
//       return NextResponse.json({ message: "unauthorized" }, { status: 400 });
//     }

//     const partner = await User.findById(session.userId);
//     if (!partner) {
//       return NextResponse.json({ message: "partner not found" }, { status: 400 });
//     }

//     const bookings = await Booking.find({
//       labour: partner._id,
//       bookingStatus: "requested",
//     });

//     return NextResponse.json(bookings, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: `fetch pending req error ${error}` },
//       { status: 500 }
//     );
//   }
// }
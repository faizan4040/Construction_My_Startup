import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();

        const session = await isAuthenticated(); // no role restriction — any logged-in user
        if (!session.isAuth) {
            return NextResponse.json({ booking: null });
        }

        const booking = await Booking.findOne({
            user: session.userId,
            bookingStatus: { $in: ["requested", "awaiting_payment", "confirmed", "started"] },
        });

        if (!booking) {
            return NextResponse.json({ booking: "idle" });
        }

        return NextResponse.json({ booking });
    } catch (error) {
        return NextResponse.json(
            { message: `get active booking error ${error}` },
            { status: 400 }
        );
    }
}
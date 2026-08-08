import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { NextResponse } from "next/server";

export async function GET(req, context) {
    try {
        const { id } = await context.params;
        await connectDB();

        const session = await isAuthenticated(); // any logged-in user (customer)
        if (!session.isAuth) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const booking = await Booking.findById(id);

        if (!booking || booking.bookingStatus !== "requested") {
            return NextResponse.json({ message: "invalid" }, { status: 400 });
        }

        // ensure this booking actually belongs to the logged-in customer
        if (booking.user.toString() !== session.userId) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        booking.bookingStatus = "cancelled";
        await booking.save();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: `cancel booking error ${error}` },
            { status: 500 }
        );
    }
}
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
            return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "booking is not found." },
                { status: 400 }
            );
        }

        // ensure this booking actually belongs to the logged-in customer
        if (booking.user.toString() !== session.userId) {
            return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
        }

        // only allow confirming cash while payment is still pending on an
        // accepted booking — avoids re-confirming an already-paid/cancelled one
        if (booking.bookingStatus !== "awaiting_payment") {
            return NextResponse.json(
                { success: false, message: "invalid booking state" },
                { status: 400 }
            );
        }

        booking.paymentStatus = "cash";
        booking.bookingStatus = "confirmed";
        await booking.save();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: `cash confirm error ${error}` },
            { status: 500 }
        );
    }
}
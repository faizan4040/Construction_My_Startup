import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req, context) {
    try {
        const { id } = await context.params;
        await connectDB();

        const session = await isAuthenticated("laber");
        if (!session.isAuth) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        const booking = await Booking.findById(id);

        if (!booking || booking.bookingStatus !== "requested") {
            return NextResponse.json({ message: "invalid" }, { status: 400 });
        }

        // ensure this booking actually belongs to the logged-in labour
        if (booking.labour.toString() !== session.userId) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }

        booking.bookingStatus = "rejected";
        await booking.save();

        // NOTE: adjust this if your socket server URL / endpoint differs
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "reject-booking",
            userId: booking.user,
            data: booking.bookingStatus,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: `reject booking error ${error}` },
            { status: 500 }
        );
    }
}
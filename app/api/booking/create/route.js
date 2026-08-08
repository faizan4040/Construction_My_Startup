import { auth } from "@/auth";
import connectDb from "@/lib/databaseConnection";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import axios from "axios";
import { NextResponse } from "next/server";

const DURATION_DAYS = { day: 1, week: 7, month: 30, year: 365 };
const DURATION_DISCOUNT = { day: 0, week: 0.05, month: 0.10, year: 0.20 };

export async function POST(req) {
    try {
        await connectDb()
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "unauthorize" },
                { status: 400 }
            )
        }

        const {
            labourId,
            category,
            pricingType,
            hours,
            durationKey,
            workAddress,
            workLocation,
            mobileNumber,
        } = await req.json()


        if (!labourId || !category || !pricingType || !workAddress || !workLocation?.latitude || !workLocation?.longitude) {
            return NextResponse.json(
                { message: "missing required details" },
                { status: 400 }
            )
        }

        const user = await User.findOne({ email: session.user.email })
        const labour = await User.findOne({
            _id: labourId,
            role: "laber",
            partnerStatus: "approved"
        })

        if (!labour) {
            return NextResponse.json(
                { message: "labour not found" },
                { status: 400 }
            )
        }

        const existing = await Booking.findOne({
            user: user._id,
            bookingStatus: {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            }
        })
        console.log(existing)

        if (existing) {
            return NextResponse.json(
                existing
            )
        }

        let fare = 0;
        let duration = 0;
        let ratePerUnit = 0;

        if (pricingType === "hourly") {
            if (!labour.hourlyRate || !hours || hours <= 0) {
                return NextResponse.json(
                    { message: "invalid hourly booking details" },
                    { status: 400 }
                )
            }
            duration = hours;
            ratePerUnit = labour.hourlyRate;
            fare = Math.round(labour.hourlyRate * hours);

        } else if (pricingType === "daily") {
            if (!labour.dailyRate || !durationKey || !DURATION_DAYS[durationKey]) {
                return NextResponse.json(
                    { message: "invalid daily booking details" },
                    { status: 400 }
                )
            }
            const days = DURATION_DAYS[durationKey];
            const discount = DURATION_DISCOUNT[durationKey];
            const rawTotal = labour.dailyRate * days;
            duration = days;
            ratePerUnit = labour.dailyRate;
            fare = Math.round(rawTotal - rawTotal * discount);

        } else {
            return NextResponse.json(
                { message: "invalid pricingType" },
                { status: 400 }
            )
        }

        const booking = await Booking.create({
            user: user._id,
            labour: labour._id,
            category,
            workAddress,

            workLocation: {
                type: "Point",
                coordinates: [workLocation.longitude, workLocation.latitude]
            },

            fare,
            pricingType,
            duration,
            ratePerUnit,

            userMobileNumber: mobileNumber,
            labourMobileNumber: labour.phone,

            bookingStatus: "requested"
        })

        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "new-booking",
            userId: labourId,
            data: booking
        })


        return NextResponse.json(
            booking, { status: 200 }
        )


    } catch (error) {
        return NextResponse.json(
            { message: `create booking error ${error}` },
            { status: 500 }
        )
    }
}
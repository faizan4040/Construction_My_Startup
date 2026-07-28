import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET(req, context) {
    try {
        const { isAuth, role } = await isAuthenticated("admin");
        if (!isAuth || role !== "admin") {
            return Response.json(
                { message: "unauthorized" },
                { status: 401 }
            );
        }

        await connectDb();
        const labourId = (await context.params).id;
        const labour = await User.findById(labourId);

        if (!labour || labour.role !== "laber") {
            return Response.json(
                { message: "labour not found" },
                { status: 404 }
            );
        }

        const roomId = `kyc-${labour._id}-${Date.now()}`;
        labour.videoKycRoomId = roomId;
        labour.videoKycStatus = "in_progress";
        labour.partnerOnBoardingSteps = 4;

        await labour.save();

        return NextResponse.json({ roomId });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "labour video kyc start error" },
            { status: 500 }
        );
    }
}
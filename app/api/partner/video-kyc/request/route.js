import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";

export async function GET() {
    try {
        await connectDb();

        const { isAuth, userId } = await isAuthenticated();
        if (!isAuth) {
            return Response.json(
                { message: "unauthorized" },
                { status: 401 }
            );
        }

        const labour = await User.findById(userId);
        if (!labour || labour.role !== "laber") {
            return Response.json(
                { message: "labour not found" },
                { status: 404 }
            );
        }

        if (labour.videoKycStatus !== "rejected") {
            return Response.json(
                { message: "you can not send kyc request at this time" },
                { status: 400 }
            );
        }

        labour.videoKycStatus = "not_started";
        labour.videoKycRejectionReason = undefined;
        labour.videoKycRoomId = undefined;
        await labour.save();

        return Response.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: `kyc request error ${error}` },
            { status: 500 }
        );
    }
}
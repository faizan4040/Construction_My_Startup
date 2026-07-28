import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";

export async function POST(req) {
    try {
        await connectDb();

        const { isAuth, role } = await isAuthenticated("admin");
        if (!isAuth || role !== "admin") {
            return Response.json(
                { message: "unauthorized" },
                { status: 401 }
            );
        }

        const { roomId, action, reason } = await req.json();

        if (!roomId) {
            return Response.json(
                { message: "roomId is required" },
                { status: 400 }
            );
        }

        if (!["approved", "rejected"].includes(action)) {
            return Response.json(
                { message: "invalid action" },
                { status: 400 }
            );
        }

        const labour = await User.findOne({
            videoKycRoomId: roomId,
            role: "laber"
        });

        if (!labour) {
            return Response.json(
                { message: "labour not found" },
                { status: 404 }
            );
        }

        if (action === "approved") {
            labour.videoKycStatus = "approved";
            labour.videoKycRejectionReason = undefined;
            labour.partnerOnBoardingSteps = 5;
        }

        if (action === "rejected") {
            if (!reason) {
                return Response.json(
                    { message: "rejection reason is required." },
                    { status: 400 }
                );
            }
            labour.videoKycStatus = "rejected";
            labour.videoKycRejectionReason = reason.trim();
        }

        await labour.save();

        return Response.json(
            { status: labour.videoKycStatus },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: `kyc complete error ${error}` },
            { status: 500 }
        );
    }
}
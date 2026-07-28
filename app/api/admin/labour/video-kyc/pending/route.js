import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";

export async function GET() {
    try {
        await connectDb();

        const { isAuth, role } = await isAuthenticated("admin");
        if (!isAuth || role !== "admin") {
            return Response.json(
                { message: "unauthorized" },
                { status: 401 }
            );
        }

        const labour = await User.find({
            role: "laber",
            partnerOnBoardingSteps: 4,
            videoKycStatus: { $in: ["pending", "in_progress"] }  
        });

        return Response.json(
            labour,
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: `labour kyc get error ${error}` },
            { status: 500 }
        );
    }
}
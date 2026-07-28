import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import PartnerBank from "@/models/PartnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/User.model";

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

        if (labour.partnerStatus === "approved") {
            return Response.json(
                { message: "labour already approved" },
                { status: 400 }
            );
        }

        const labourDocs = await PartnerDocs.findOne({ owner: labour._id });
        const labourBank = await PartnerBank.findOne({ owner: labour._id });

        if (!labourDocs || !labourBank) {
            return Response.json(
                { message: "labour did not complete onboarding steps" },
                { status: 400 }
            );
        }

        labour.partnerStatus = "approved";
        labour.videoKycStatus = "pending";
        labour.partnerOnBoardingSteps = 4;
        await labour.save();

        labourDocs.status = "approved";
        await labourDocs.save();

        labourBank.status = "verified";
        await labourBank.save();

        return Response.json(
            { message: "labour approved successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: `labour approve error ${error}` },
            { status: 500 }
        );
    }
}
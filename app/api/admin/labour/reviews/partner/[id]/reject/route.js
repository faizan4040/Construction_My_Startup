import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import PartnerBank from "@/models/PartnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/User.model";

export async function POST(req, context) {
    try {
        const { isAuth, role } = await isAuthenticated("admin");
        if (!isAuth || role !== "admin") {
            return Response.json(
                { message: "unauthorized" },
                { status: 401 }
            );
        }

        await connectDb();
        const { rejectionReason } = await req.json();
        const labourId = (await context.params).id;
        const labour = await User.findById(labourId);

        if (!labour || labour.role !== "laber") {
            return Response.json(
                { message: "labour not found" },
                { status: 404 }
            );
        }

        labour.partnerStatus = "rejected";
        labour.rejectionReason = rejectionReason;
        await labour.save();

        return Response.json(
            { message: "labour rejected successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return Response.json(
            { message: `labour reject error ${error}` },
            { status: 500 }
        );
    }
}
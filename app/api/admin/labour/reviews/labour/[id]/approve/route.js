import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import Labour from "@/models/Labour.model";
import User from "@/models/User.model";

export async function GET(req, context) {
  try {
    const { isAuth, role } = await isAuthenticated("admin");
    if (!isAuth || role !== "admin") {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }

    await connectDb();

    const labourId = (await context.params).id;
    const labour = await Labour.findById(labourId);

    if (!labour) {
      return Response.json({ message: "labour not found" }, { status: 400 });
    }

    labour.status = "approved";
    labour.rejectionReason = undefined;
    labour.isVerified = true;
    await labour.save();

    const partner = await User.findById(labour.owner);
    if (!partner) {
      return Response.json({ message: "partner not found" }, { status: 400 });
    }

    // Final review approved → onboarding step 8 = Live (matches your
    // STEPS array: 7 "Final Review" -> 8 "Live")
    partner.partnerOnBoardingSteps = 7;
    await partner.save();

    return Response.json(labour, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `labour approve error ${error}` },
      { status: 500 }
    );
  }
}
import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import Labour from "@/models/Labour.model";

export async function POST(req, context) {
  try {
    const { isAuth, role } = await isAuthenticated("admin");
    if (!isAuth || role !== "admin") {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }

    const { reason } = await req.json();

    await connectDb();

    const labourId = (await context.params).id;
    const labour = await Labour.findById(labourId);

    if (!labour) {
      return Response.json({ message: "labour not found" }, { status: 400 });
    }

    labour.status = "rejected";
    labour.rejectionReason = reason;
    await labour.save();

    return Response.json(labour, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `labour rejected error ${error}` },
      { status: 500 }
    );
  }
}
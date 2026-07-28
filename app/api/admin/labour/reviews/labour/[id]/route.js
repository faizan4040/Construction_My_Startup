import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import Labour from "@/models/Labour.model";

export async function GET(req, context) {
  try {
    const { isAuth, role } = await isAuthenticated("admin");
    if (!isAuth || role !== "admin") {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }

    await connectDb();

    const labourId = (await context.params).id;

    // NOTE: `id` here is the Labour document's own _id — the "Pending
    // Labour Review" tab's items are already Labour docs (populated
    // with owner), so the Review button navigates using item._id which
    // is the Labour _id, not the User/owner id.
    const labour = await Labour.findById(labourId).populate("owner");

    if (!labour) {
      return Response.json({ message: "labour not found" }, { status: 400 });
    }

    return Response.json(labour, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `labour review get error ${error}` },
      { status: 500 }
    );
  }
}
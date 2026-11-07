import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { labourServiceJob, previewSplit } from "@/lib/labourJobs";

// Scheduled service jobs the admin assigned to this labour
export async function GET() {
  try {
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const [open, history] = await Promise.all([
      ServiceBooking.find({ assignedLabour: s.userId, status: { $in: ["assigned", "in_progress"] } })
        .sort({ slotDate: 1, offeredAt: 1 }).lean(),
      ServiceBooking.find({ assignedLabour: s.userId, status: { $in: ["completed", "cancelled"] } })
        .sort({ updatedAt: -1 }).limit(20).lean(),
    ]);

    const shape = async (b) => labourServiceJob(b, b.labourAmount > 0 ? null : await previewSplit(b));
    const all = await Promise.all(open.map(shape));
    return NextResponse.json(
      {
        offers: all.filter((j) => j.assignStatus === "offered"),
        active: all.filter((j) => j.assignStatus === "accepted"),
        history: await Promise.all(history.map(shape)),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("partner service jobs error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import { getSettings, updateSettings, SETTING_RULES } from "@/lib/settings";
import { emitToAdmins } from "@/lib/socketEmit";

export async function GET() {
  await connectDb();
  if (!(await isAuthenticated("admin")).isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getSettings(true), rules: SETTING_RULES }, { headers: { "Cache-Control": "no-store" } });
}

// New commission applies to jobs completed from now on. Finished jobs keep the rate frozen on them.
export async function PUT(req) {
  try {
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const r = await updateSettings(await req.json(), s.userId);
    if (r.error) return NextResponse.json({ message: r.error }, { status: 400 });
    await emitToAdmins("admin-booking-update", { kind: "settings", status: "updated" });
    return NextResponse.json(r);
  } catch (error) {
    console.error("settings update error", error);
    return NextResponse.json({ message: "could not save" }, { status: 500 });
  }
}

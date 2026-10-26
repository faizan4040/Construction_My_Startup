// app/api/admin/earning/route.js
import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import { last7Days } from "@/lib/earnings";

export async function GET() {
  try {
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const data = await last7Days({}, "adminCommission");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin earning error", error);
    return NextResponse.json({ message: "admin earning error" }, { status: 500 });
  }
}
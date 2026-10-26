import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import MaterialOrder from "@/models/MaterialOrder.model";
import { isAuthenticated } from "@/lib/authentication";

// files from the logged-in customer's earlier orders (for the "Past lists" option)
export async function GET() {
  try {
    const auth = await isAuthenticated();
    if (!auth?.isAuth) {
      return NextResponse.json({ success: true, data: { loggedIn: false, files: [] } });
    }

    await connectDB();
    const orders = await MaterialOrder.find({ user: auth.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("files createdAt")
      .lean();

    const seen = new Set();
    const files = [];
    for (const o of orders) {
      for (const f of o.files || []) {
        if (seen.has(f.url)) continue;
        seen.add(f.url);
        files.push({ ...f, createdAt: o.createdAt });
      }
    }

    return NextResponse.json({ success: true, data: { loggedIn: true, files: files.slice(0, 24) } });
  } catch (error) {
    console.error("[material-orders/mine]", error);
    return NextResponse.json({ success: false, message: "Could not load past lists." }, { status: 500 });
  }
}
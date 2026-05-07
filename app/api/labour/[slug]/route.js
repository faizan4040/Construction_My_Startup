import { NextResponse } from "next/server"
import connectDB from "@/lib/connectDB"
import LabourProfile from "@/models/LabourProfile"

// GET /api/labour/[slug]
export async function GET(request, { params }) {
  try {
    await connectDB()

    const { slug } = params

    const profile = await LabourProfile.findOne({ slug, isActive: true })
      .populate("user", "name email")
      .lean()

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error("GET PROFILE ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}
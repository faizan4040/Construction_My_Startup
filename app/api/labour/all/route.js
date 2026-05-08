import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import LabourProfile from "@/models/LabourProfile.model.js"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const profession = searchParams.get("profession") || ""
    const city       = searchParams.get("city") || ""
    const page       = parseInt(searchParams.get("page")) || 1
    const limit      = parseInt(searchParams.get("limit")) || 20

    // Only require isProfileComplete — drop isActive filter so new profiles show
    const filter = { isProfileComplete: true }
    if (profession) filter.profession = { $regex: profession, $options: "i" }
    if (city)       filter.city       = { $regex: city, $options: "i" }

    const skip = (page - 1) * limit

    const [profiles, total] = await Promise.all([
      LabourProfile.find(filter)
        .select("firstName lastName slug profession city state profileImageUrl rating reviewCount experienceYears hourlyRate skills availability isVerified")
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LabourProfile.countDocuments(filter),
    ])

    return NextResponse.json(
      { profiles, total, page, pages: Math.ceil(total / limit) },
      { status: 200 }
    )
  } catch (error) {
    console.error("ALL PROFILES ERROR:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}






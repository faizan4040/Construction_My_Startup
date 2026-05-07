import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import LabourProfile from "@/models/LabourProfile.model.js"
import { getCurrentUser } from "@/lib/getCurrentUser"

// GET /api/labour/my-profile
export async function GET(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const profile = await LabourProfile.findOne({ user: currentUser.id }).lean()

    // Return null profile cleanly — not a 404
    return NextResponse.json({ profile: profile || null }, { status: 200 })
  } catch (error) {
    console.error("MY PROFILE ERROR:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}









// import { NextResponse } from "next/server"
// import connectDB from '@/lib/databaseConnection'
// import LabourProfile from "@/models/LabourProfile"
// import { getCurrentUser } from "@/lib/getCurrentUser"

// // GET /api/labour/my-profile — get logged-in labour's own profile
// export async function GET(request) {
//   try {
//     await connectDB()

//     const currentUser = await getCurrentUser(request)
//     if (!currentUser) {
//       return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
//     }

//     const profile = await LabourProfile.findOne({ user: currentUser.id })
//       .populate("user", "name email")
//       .lean()

//     if (!profile) {
//       return NextResponse.json({ profile: null }, { status: 200 })
//     }

//     return NextResponse.json({ profile }, { status: 200 })
//   } catch (error) {
//     console.error("MY PROFILE ERROR:", error)
//     return NextResponse.json(
//       { message: error.message || "Server error" },
//       { status: 500 }
//     )
//   }
// }
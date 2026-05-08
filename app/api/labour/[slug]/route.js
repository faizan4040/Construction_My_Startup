import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import LabourProfile from "@/models/LabourProfile.model.js"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { slug } = await params

    // Search by slug OR by _id (in case slug wasn't generated properly)
    const profile = await LabourProfile.findOne({
      $or: [
        { slug },
        { _id: slug.match(/^[a-f\d]{24}$/i) ? slug : null },
      ],
    }).lean()

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error("GET PROFILE ERROR:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}





// import { NextResponse } from "next/server"
// import connectDB from "@/lib/databaseConnection"
// import LabourProfile from "@/models/LabourProfile.model.js"

// // GET /api/labour/[slug]
// export async function GET(request, { params }) {
//   try {
//     await connectDB()

//     const { slug } = params

//     const profile = await LabourProfile.findOne({ slug, isActive: true })
//       .populate("User", "name email")
//       .lean()

//     if (!profile) {
//       return NextResponse.json({ message: "Profile not found" }, { status: 404 })
//     }

//     return NextResponse.json({ profile }, { status: 200 })
//   } catch (error) {
//     console.error("GET PROFILE ERROR:", error)
//     return NextResponse.json(
//       { message: error.message || "Server error" },
//       { status: 500 }
//     )
//   }
// }
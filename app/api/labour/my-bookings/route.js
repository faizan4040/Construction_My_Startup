// import { NextResponse } from "next/server"
// import connectDB from "@/lib/databaseConnection"
// import Booking from "@/models/Booking.model.js"
// import { getCurrentUser } from "@/lib/getCurrentUser"

// // GET /api/labour/my-bookings
// // Returns all bookings where the logged-in user is the CLIENT
// export async function GET(request) {
//   try {
//     await connectDB()

//     const currentUser = await getCurrentUser(request)
//     if (!currentUser) {
//       return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
//     }

//     // Fetch bookings where this user is the customer
//     // Populate labour profile so we get labourName, profession, etc.
//     const bookings = await Booking.find({ clientUser: currentUser.id })
//       .sort({ createdAt: -1 })
//       .populate("labourUser", "firstName lastName profession profileImage")
//       .lean()

//     // Shape the data for the frontend
//     const shaped = bookings.map((b) => ({
//       _id:         b._id,
//       status:      b.status,           // pending | accepted | rejected | completed
//       clientRead:  b.clientRead,
//       profession:  b.labourUser?.profession || "",
//       labourName:  b.labourUser
//         ? `${b.labourUser.firstName} ${b.labourUser.lastName}`
//         : "",
//       labourImage: b.labourUser?.profileImage || "",
//       description: b.description || "",
//       date:        b.date || null,
//       address:     b.address || "",
//       city:        b.city || "",
//       phone:       b.phone || "",
//       createdAt:   b.createdAt,
//     }))

//     // Mark bookings as read by client (so the "NEW UPDATE" dot clears on next open)
//     // We do this async — don't await so response is instant
//     Booking.updateMany(
//       { clientUser: currentUser.id, clientRead: false },
//       { $set: { clientRead: true } }
//     ).catch(() => {})

//     return NextResponse.json({ data: shaped }, { status: 200 })

//   } catch (error) {
//     console.error("MY-BOOKINGS ERROR:", error)
//     return NextResponse.json(
//       { message: error.message || "Server error" },
//       { status: 500 }
//     )
//   }
// }
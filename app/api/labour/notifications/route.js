import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import Booking from "@/models/Booking.model.js"
import { getCurrentUser } from "@/lib/getCurrentUser"

// GET /api/labour/notifications
// Returns all unread (pending) bookings for the logged-in labour
export async function GET(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const notifications = await Booking.find({
      labourUser: currentUser.id,
      labourRead: false,
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ notifications, count: notifications.length }, { status: 200 })
  } catch (error) {
    console.error("NOTIFICATIONS ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/labour/notifications — mark all as read
export async function PATCH(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    await Booking.updateMany(
      { labourUser: currentUser.id, labourRead: false },
      { $set: { labourRead: true } }
    )

    return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 })
  } catch (error) {
    console.error("MARK READ ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}
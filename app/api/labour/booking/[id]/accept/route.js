import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import Booking from "@/models/Booking.model.js"
import { getCurrentUser } from "@/lib/getCurrentUser"

// PATCH /api/labour/booking/[id]/accept
// body: { action: "accepted" | "rejected" }
export async function PATCH(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = params
    const { action } = await request.json()

    if (!["accepted", "rejected"].includes(action)) {
      return NextResponse.json(
        { message: "Action must be 'accepted' or 'rejected'" },
        { status: 400 }
      )
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: id, labourUser: currentUser.id },
      {
        $set: {
          status: action,
          labourRead: true,
          clientRead: false,
        },
      },
      { new: true }
    )

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: `Booking ${action} successfully`, booking },
      { status: 200 }
    )
  } catch (error) {
    console.error("ACCEPT/REJECT ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}
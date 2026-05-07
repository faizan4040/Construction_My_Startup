import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import Booking from "@/models/Booking.model.js"
import LabourProfile from "@/models/LabourProfile.model.js"
import { getCurrentUser } from "@/lib/getCurrentUser"

// POST /api/labour/booking — client creates a booking
export async function POST(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { labourSlug, clientName, clientPhone, workDate, description, address } = body

    if (!labourSlug || !clientName || !clientPhone || !workDate || !description) {
      return NextResponse.json(
        { message: "All booking fields are required" },
        { status: 400 }
      )
    }

    // Find the labour profile
    const labourProfile = await LabourProfile.findOne({ slug: labourSlug })
    if (!labourProfile) {
      return NextResponse.json({ message: "Labour profile not found" }, { status: 404 })
    }

    const booking = await Booking.create({
      labour:      labourProfile._id,
      labourUser:  labourProfile.user,
      client:      currentUser.id,
      clientName,
      clientPhone,
      workDate:    new Date(workDate),
      description,
      address:     address || "",
      status:      "pending",
      labourRead:  false,
      clientRead:  true,
    })

    // Increment booking count on profile
    await LabourProfile.findByIdAndUpdate(labourProfile._id, {
      $inc: { totalBookings: 1 },
    })

    return NextResponse.json(
      { message: "Booking request sent successfully", booking },
      { status: 201 }
    )
  } catch (error) {
    console.error("BOOKING ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}

// GET /api/labour/booking — labour gets their own bookings
export async function GET(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const bookings = await Booking.find({ labourUser: currentUser.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}
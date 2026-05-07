import { NextResponse } from "next/server"
import connectDB from "@/lib/connectDB"
import Booking from "@/models/Booking"
import { getCurrentUser } from "@/lib/getCurrentUser"

// POST /api/labour/booking/[id]/message — send a message
export async function POST(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = params
    const { text } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 })
    }

    // Determine sender role
    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    const isLabour = booking.labourUser.toString() === currentUser.id.toString()
    const isClient = booking.client.toString() === currentUser.id.toString()

    if (!isLabour && !isClient) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    const senderRole = isLabour ? "labour" : "client"

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $push: {
          messages: {
            sender: currentUser.id,
            senderRole,
            text: text.trim(),
            createdAt: new Date(),
          },
        },
        $set: {
          // Mark unread for the other party
          labourRead: isClient ? false : true,
          clientRead: isLabour ? false : true,
        },
      },
      { new: true }
    )

    const newMessage = updatedBooking.messages[updatedBooking.messages.length - 1]

    return NextResponse.json({ message: "Message sent", data: newMessage }, { status: 200 })
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}

// GET /api/labour/booking/[id]/message — get all messages for a booking
export async function GET(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = params

    const booking = await Booking.findById(id)
      .select("messages labourUser client status clientName")
      .lean()

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    const isLabour = booking.labourUser.toString() === currentUser.id.toString()
    const isClient = booking.client.toString() === currentUser.id.toString()

    if (!isLabour && !isClient) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    // Mark as read for current user
    const readField = isLabour ? "labourRead" : "clientRead"
    await Booking.findByIdAndUpdate(id, { $set: { [readField]: true } })

    return NextResponse.json(
      { messages: booking.messages, status: booking.status, clientName: booking.clientName },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}
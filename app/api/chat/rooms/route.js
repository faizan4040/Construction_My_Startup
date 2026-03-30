// app/api/chat/rooms/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import ChatRoom from "@/models/ChatRoom.model";

/**
 * GET /api/chat/rooms
 * Returns all rooms sorted by latest activity (admin sidebar).
 * Optional: ?userId=xxx  returns room for that specific user.
 */
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const query = userId ? { userId } : {};

    // No .populate() — avoids MissingSchemaError for User/Admin models
    const rooms = await ChatRoom.find(query).sort({ lastMessageAt: -1 });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    // console.error(" GET /api/chat/rooms:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/rooms
 * Body: { userId }
 * Creates a new room OR returns the existing one for this user.
 */
export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await req.json();

    // Validate ObjectId before hitting MongoDB
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Valid userId is required" },
        { status: 400 }
      );
    }

    // Upsert — one room per user
    let room = await ChatRoom.findOne({ userId });
    if (!room) {
      room = await ChatRoom.create({ userId });
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    // console.error(" POST /api/chat/rooms:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create room" },
      { status: 500 }
    );
  }
}
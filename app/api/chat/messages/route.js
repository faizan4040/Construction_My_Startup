// ============================================================
//  app/api/chat/messages/route.js
// ============================================================
import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import Message from "@/models/Message.model";
import ChatRoom from "@/models/ChatRoom.model";

/**
 * GET /api/chat/messages?roomId=xxx
 * Returns all messages for a room, oldest → newest.
 */
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId is required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error(" GET /api/chat/messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * HTTP fallback — normally messages are sent via Socket.IO.
 * Body: { roomId, senderType, senderId, message }
 */
export async function POST(req) {
  try {
    await connectDB();
    const { roomId, senderType, senderId, message } = await req.json();

    if (!roomId || !senderType || !senderId || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      roomId,
      senderType,
      senderId,
      message: message.trim(),
    });

    // Update room
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage:   message.trim(),
      lastMessageAt: new Date(),
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    console.error(" POST /api/chat/messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save message" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/messages
 * Mark messages in a room as read.
 * Body: { roomId, readerType: "user" | "admin" }
 */
export async function PATCH(req) {
  try {
    await connectDB();
    const { roomId, readerType } = await req.json();

    if (!roomId || !readerType) {
      return NextResponse.json(
        { success: false, message: "roomId and readerType are required" },
        { status: 400 }
      );
    }

    // Mark messages NOT sent by the reader as read
    const senderFilter = readerType === "admin" ? "user" : "admin";
    await Message.updateMany(
      { roomId, senderType: senderFilter, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(" PATCH /api/chat/messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
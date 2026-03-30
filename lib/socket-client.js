// lib/socket-client.js
// Singleton — one socket instance for the whole browser session
import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      autoConnect:  false,
      transports:   ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
    });
  }
  return socket;
}

/**
 * Connect the socket and register the user/admin as online.
 * Safe to call multiple times — won't reconnect if already connected.
 */
export function connectSocket({ userId, role = "user" }) {
  const s = getSocket();

  if (!s.connected) {
    s.connect();
    s.once("connect", () => {
      console.log("🟢 Socket connected:", s.id);
      s.emit("user-online", { userId, role });
    });
  } else {
    // Already connected — just re-announce presence
    s.emit("user-online", { userId, role });
  }

  return s;
}

/**
 * Join a specific chat room.
 */
export function joinRoom(roomId) {
  const s = getSocket();
  if (s.connected) {
    s.emit("join-room", roomId);
  } else {
    s.once("connect", () => s.emit("join-room", roomId));
  }
}

/**
 * Fully disconnect (call when user logs out).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
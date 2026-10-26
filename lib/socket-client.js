import { io } from "socket.io-client";

let socket = null;
let claimedUserId = null; // old connectSocket({ userId }) support
let retryTimer = null;
let retryDelay = 2000;

async function fetchToken() {
  const r = await fetch("/api/socket/token", { credentials: "include", cache: "no-store" });
  if (!r.ok) throw new Error(`no socket token (HTTP ${r.status})`);
  return (await r.json()).token;
}

export function getSocket() {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "";

    const s = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // a fresh signed token on every (re)connect; the server trusts this, never the client's userId
      auth: (cb) =>
        fetchToken()
          .then((token) => cb({ token }))
          .catch((e) => {
            console.warn("[socket] token fetch failed:", e.message);
            cb({ token: "" });
          }),
    });
    socket = s;

    s.on("connect", () => {
      console.log("🟢 Socket connected:", s.id);
      retryDelay = 2000;
      if (claimedUserId) s.emit("identity", claimedUserId); // old behaviour, server just logs it
    });

    // when the server denies the handshake, socket.io does NOT retry on its own: retry here
    s.on("connect_error", (err) => {
      console.warn("[socket] connect_error:", err.message);
      if (!s.active) {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => {
          if (socket === s && !s.connected) s.connect();
        }, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    });
  }
  return socket;
}

/**
 * Connect the socket. Safe to call many times.
 * `userId` is optional (old `connectSocket({ userId })` calls keep working):
 * the server identifies the user from the signed token, not from this value.
 */
export function connectSocket(arg) {
  const s = getSocket();
  if (arg?.userId) {
    claimedUserId = arg.userId;
    if (s.connected) s.emit("identity", claimedUserId); // already connected: re-announce
  }
  if (!s.connected) s.connect();
  return s;
}

/** General chat room (ChatWidget). */
export function joinRoom(roomId) {
  const s = getSocket();
  if (s.connected) s.emit("join-room", roomId);
  else s.once("connect", () => s.emit("join-room", roomId));
}

/** Booking room: live labour location + booking updates. */
export function joinJobRoom(bookingId) {
  const s = getSocket();
  if (s.connected) s.emit("join-job", bookingId);
  else s.once("connect", () => s.emit("join-job", bookingId));
}

/** Labour's GPS for the nearby search (userId is accepted but ignored). */
export function updateLocation({ latitude, longitude, accuracy }) {
  const s = getSocket();
  if (s.connected) s.emit("update-location", { latitude, longitude, accuracy });
}

/** Labour's GPS for ONE booking, broadcast to that booking's room. */
export function sendLabourLocationUpdate({ bookingId, latitude, longitude, accuracy, status }) {
  const s = getSocket();
  if (s.connected) s.emit("labour-location-update", { bookingId, latitude, longitude, accuracy, status });
}

/** Booking chat relay (server checks the sender joined that booking's room). */
export function sendChatMessage(data) {
  const s = getSocket();
  if (s.connected) s.emit("chat-message", data);
}

/** Call on logout, so the next login gets a fresh identity. */
export function disconnectSocket() {
  clearTimeout(retryTimer);
  claimedUserId = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}















// import { io } from "socket.io-client";

// let socket = null;

// export function getSocket() {
//   if (!socket) {
//     // Safest option: prefer the dedicated socket server URL if it's
//     // set, otherwise fall back to the app URL. This way the socket
//     // still connects correctly whether the two are the same domain
//     // or genuinely different servers.
//     const socketUrl =
//       process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
//       process.env.NEXT_PUBLIC_APP_URL ||
//       "";

//     socket = io(socketUrl, {
//       autoConnect: false,
//       transports: ["websocket", "polling"],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });
//   }
//   return socket;
// }

// /**
//  * Connect the socket and register the user as online.
//  * Safe to call multiple times — won't reconnect if already connected.
//  *
//  * NOTE: the server only listens for "identity" with a plain userId
//  * (not { userId, role }) — see socketServer/index.js. If you need role
//  * on the server side too, that event handler needs updating to match,
//  * rather than changing this alone.
//  */
// export function connectSocket({ userId }) {
//   const s = getSocket();

//   if (!s.connected) {
//     s.connect();
//     s.once("connect", () => {
//       console.log("🟢 Socket connected:", s.id);
//       s.emit("identity", userId);
//     });
//   } else {
//     // Already connected — just re-announce presence
//     s.emit("identity", userId);
//   }

//   return s;
// }

// /**
//  * Join a general chat room (used by ChatWidget for support/general
//  * conversations that aren't tied to a specific booking).
//  */
// export function joinRoom(roomId) {
//   const s = getSocket();
//   if (s.connected) {
//     s.emit("join-room", roomId);
//   } else {
//     s.once("connect", () => s.emit("join-room", roomId));
//   }
// }

// /**
//  * Join a specific job/booking room (chat + location updates for that
//  * booking both flow through this room).
//  */
// export function joinJobRoom(bookingId) {
//   const s = getSocket();
//   if (s.connected) {
//     s.emit("join-job", bookingId);
//   } else {
//     s.once("connect", () => s.emit("join-job", bookingId));
//   }
// }

// /**
//  * Push the labour partner's current GPS position while they're heading
//  * to / working a job. Matches server's "update-location" listener.
//  */
// export function updateLocation({ userId, latitude, longitude }) {
//   const s = getSocket();
//   if (s.connected) {
//     s.emit("update-location", { userId, latitude, longitude });
//   }
// }

// /**
//  * Push a location update scoped to a specific booking, broadcast to
//  * everyone in that job room (so the customer sees it live).
//  */
// export function sendLabourLocationUpdate({ bookingId, latitude, longitude, status }) {
//   const s = getSocket();
//   if (s.connected) {
//     s.emit("labour-location-update", { bookingId, latitude, longitude, status });
//   }
// }

// /**
//  * Send a chat message scoped to a booking's job room.
//  */
// export function sendChatMessage(data) {
//   const s = getSocket();
//   if (s.connected) {
//     s.emit("chat-message", data);
//   }
// }

// /**
//  * Fully disconnect (call when user logs out).
//  */
// export function disconnectSocket() {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// }







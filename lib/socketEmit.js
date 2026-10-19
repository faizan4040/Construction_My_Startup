import axios from "axios";

const base = () => process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
const headers = () => ({ "x-emit-secret": process.env.SOCKET_EMIT_SECRET });

export async function emitToUser(userId, event, data) {
  try {
    await axios.post(
      `${base()}/emit`,
      { event, userId: String(userId), data },
      { headers: headers(), timeout: 3000 }
    );
    return true;
  } catch (error) {
    console.error("socket emit failed:", event, error.message);
    return false; // never fail the main request because a notification failed
  }
}

// Admin dashboards only get a "refresh" ping (no personal data in the socket)
export async function emitToAdmins(event, data) {
  try {
    await axios.post(
      `${base()}/emit`,
      { event, room: "admins", data },
      { headers: headers(), timeout: 3000 }
    );
    return true;
  } catch (error) {
    console.error("admin emit failed:", event, error.message);
    return false;
  }
}
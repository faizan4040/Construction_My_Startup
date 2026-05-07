import { jwtVerify } from "jose"

/**
 * Get the current logged-in user from the request.
 * Matches your OTP verify route:
 *   - cookie name : access_token
 *   - secret      : process.env.SECRET_KEY
 *   - JWT payload : { _id, role, name, avatar }
 *
 * Returns { id, role, name, avatar } or null if not authenticated.
 */
export async function getCurrentUser(request) {
  try {
    // ── Read access_token cookie ──────────────────────────────
    const cookieHeader = request.headers.get("cookie") || ""

    // Parse access_token (may be URL-encoded)
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/)
    let token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

    // Fallback: Authorization: Bearer <token>
    if (!token) {
      const authHeader = request.headers.get("authorization") || ""
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim()
      }
    }

    if (!token) return null

    // ── Verify with SECRET_KEY ────────────────────────────────
    const secret = new TextEncoder().encode(process.env.SECRET_KEY)
    const { payload } = await jwtVerify(token, secret)

    // payload shape: { _id, role, name, avatar }
    return {
      id:     payload._id,
      role:   payload.role,
      name:   payload.name,
      avatar: payload.avatar,
    }
  } catch (err) {
    // Token missing, expired, or invalid — not authenticated
    return null
  }
}
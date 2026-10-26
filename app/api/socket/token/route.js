import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { isAuthenticated } from "@/lib/authentication";

const deny = () => NextResponse.json({ message: "unauthorized" }, { status: 401 });

export async function GET() {
  const s = await isAuthenticated();

  if (!process.env.SOCKET_JWT_SECRET) {
    console.error("[socket-token] SOCKET_JWT_SECRET missing in Next env (restart the Next server after editing .env)");
    return deny();
  }
  if (!s?.isAuth) {
    console.log("[socket-token] not logged in (isAuthenticated() returned isAuth false)");
    return deny();
  }
  if (!s.userId) {
    console.error("[socket-token] isAuthenticated() has no userId; keys it returns:", Object.keys(s));
    return deny();
  }

  const token = await new SignJWT({ uid: String(s.userId), role: s.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(process.env.SOCKET_JWT_SECRET));

  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
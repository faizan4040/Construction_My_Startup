import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"
import { jwtVerify } from "jose"

export default async function proxy(request) {
  const { pathname } = request.nextUrl
  const hasToken = request.cookies.has("access_token")

  // Allow auth pages if not logged in
  if (pathname.startsWith("/auth") && !hasToken) {
    return NextResponse.next()
  }

  if (!hasToken) {
    return NextResponse.redirect(
      new URL(WEBSITE_LOGIN, request.url)
    )
  }

  try {
    const token = request.cookies.get("access_token")?.value

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SECRET_KEY)
    )

    const role = payload.role

    if (pathname.startsWith("/auth")) {
      return NextResponse.redirect(
        new URL(
          role === "admin" ? ADMIN_DASHBOARD : USER_DASHBOARD,
          request.url
        )
      )
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url))
    }

    if (pathname.startsWith("/my-account") && role !== "user") {
      return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(
      new URL(WEBSITE_LOGIN, request.url)
    )
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/my-account/:path*",
  ],
}

// import { NextResponse } from "next/server";
// import { WEBSITE_LOGIN, USER_DASHBOARD } from "./routes/WebsiteRoute";
// import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute";
// import { jwtVerify } from "jose";

// /* ── Role → home dashboard mapping ──────────────────────────────── */
// const ROLE_HOME = {
//   admin:        "/admin/dashboard",
//   user:         "/my-account/dashboard",
//   shop_owner:   "/shop/dashboard",
//   delivery_boy: "/delivery/dashboard",
//   labour:       "/labour/dashboard",
// };

// export default async function proxy(request) {
//   const { pathname } = request.nextUrl;
//   const hasToken = request.cookies.has("access_token");

//   /* ── 1. Public auth pages — allow if not logged in ─────────── */
//   if (pathname.startsWith("/auth") && !hasToken) {
//     return NextResponse.next();
//   }

//   /* ── 2. No token — redirect to login ────────────────────────── */
//   if (!hasToken) {
//     const loginUrl = new URL(WEBSITE_LOGIN, request.url);
//     loginUrl.searchParams.set("callback", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   try {
//     const token = request.cookies.get("access_token")?.value;

//     const { payload } = await jwtVerify(
//       token,
//       new TextEncoder().encode(process.env.SECRET_KEY)
//     );

//     const role = payload.role;

//     /* ── 3. Already logged-in user visits /auth → redirect home ─ */
//     if (pathname.startsWith("/auth")) {
//       const home = ROLE_HOME[role] || USER_DASHBOARD;
//       return NextResponse.redirect(new URL(home, request.url));
//     }

//     /* ── 4. Role-based route guards ─────────────────────────────── */

//     // Admin-only routes
//     if (pathname.startsWith("/admin") && role !== "admin") {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
//     }

//     // Buyer dashboard
//     if (pathname.startsWith("/my-account") && role !== "user") {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
//     }

//     // Shop owner dashboard
//     if (pathname.startsWith("/shop") && role !== "shop_owner" && role !== "admin") {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
//     }

//     // Delivery boy dashboard
//     if (
//       pathname.startsWith("/delivery") &&
//       role !== "delivery_boy" &&
//       role !== "admin"
//     ) {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
//     }

//     // Labour dashboard
//     if (
//       pathname.startsWith("/labour") &&
//       role !== "labour" &&
//       role !== "admin"
//     ) {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
//     }

//     return NextResponse.next();
//   } catch {
//     /* ── 5. Invalid / expired token ─────────────────────────────── */
//     const response = NextResponse.redirect(
//       new URL(WEBSITE_LOGIN, request.url)
//     );
//     response.cookies.delete("access_token");
//     return response;
//   }
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/my-account/:path*",
//     "/shop/:path*",
//     "/delivery/:path*",
//     "/labour/:path*",
//     "/auth/:path*",
//   ],
// };





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

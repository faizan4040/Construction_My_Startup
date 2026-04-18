import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { WEBSITE_LOGIN, USER_DASHBOARD } from "./routes/WebsiteRoute";
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute";

/* ─── Types ─────────────────────────────────────────────────────── */
type Role = "admin" | "customer" | "shop owner" | "laber" | "delivery boy";

interface AuthPayload extends JWTPayload {
  role?: Role;
  userId?: string;
}

/* ─── Role → dashboard URL map ─────────────────────────────────── */
const ROLE_DASHBOARDS: Record<Role, string> = {
  admin:          ADMIN_DASHBOARD,
  customer:       USER_DASHBOARD,
  "shop owner":   "/shop/dashboard",
  laber:          "/labour/dashboard",
  "delivery boy": "/delivery/dashboard",
};

/* ─── Role → protected path prefix ─────────────────────────────── */
const ROLE_PREFIXES: Record<Role, string> = {
  admin:          "/admin",
  customer:       "/my-account",
  "shop owner":   "/shop",
  laber:          "/labour",
  "delivery boy": "/delivery",
};

/* ─── Helpers ───────────────────────────────────────────────────── */
function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/auth");
}

function isValidRole(role: unknown): role is Role {
  return (
    typeof role === "string" &&
    Object.keys(ROLE_DASHBOARDS).includes(role)
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MIDDLEWARE
═══════════════════════════════════════════════════════════════════ */
export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const tokenCookie  = request.cookies.get("access_token");
  const hasToken     = Boolean(tokenCookie?.value);

  /* ── Unauthenticated user ── */
  if (!hasToken) {
    // Allow /auth/* pages (login, register, verify-email, etc.)
    if (isAuthPath(pathname)) return NextResponse.next();

    // Redirect to login with callback so user lands back after login
    const loginUrl = new URL(WEBSITE_LOGIN, request.url);
    loginUrl.searchParams.set("callback", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* ── Authenticated: verify JWT ── */
  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);

    const { payload } = await jwtVerify(tokenCookie!.value, secret);

    const authPayload = payload as AuthPayload;
    const role        = authPayload?.role;

    // Unknown / missing role → clear cookie and send to login
    if (!isValidRole(role)) {
      const res = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
      res.cookies.delete("access_token");
      return res;
    }

    /* ── Logged-in user visiting /auth/* → go to their dashboard ── */
    if (isAuthPath(pathname)) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[role], request.url)
      );
    }

    /* ── Block access to another role's protected area ── */
    const roleEntries = Object.entries(ROLE_PREFIXES) as [Role, string][];
    for (const [r, prefix] of roleEntries) {
      if (pathname.startsWith(prefix) && role !== r) {
        // Send the user back to THEIR own dashboard
        return NextResponse.redirect(
          new URL(ROLE_DASHBOARDS[role], request.url)
        );
      }
    }

    return NextResponse.next();

  } catch {
    // JWT expired / tampered → clear bad cookie and redirect to login
    const res = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
    res.cookies.delete("access_token");
    return res;
  }
}

/* ─── Matcher: only run middleware on these paths ───────────────── */
export const config = {
  matcher: [
    "/admin/:path*",
    "/my-account/:path*",
    "/shop/:path*",
    "/labour/:path*",
    "/delivery/:path*",
    "/auth/:path*",
  ],
};















// import { NextResponse } from "next/server"
// import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
// import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"
// import { jwtVerify } from "jose"

// export default async function proxy(request) {
//   const { pathname } = request.nextUrl
//   const hasToken = request.cookies.has("access_token")

//   // Allow auth pages if not logged in
//   if (pathname.startsWith("/auth") && !hasToken) {
//     return NextResponse.next()
//   }

//   if (!hasToken) {
//     return NextResponse.redirect(
//       new URL(WEBSITE_LOGIN, request.url)
//     )
//   }

//   try {
//     const token = request.cookies.get("access_token")?.value

//     const { payload } = await jwtVerify(
//       token,
//       new TextEncoder().encode(process.env.SECRET_KEY)
//     )

//     const role = payload.role

//     if (pathname.startsWith("/auth")) {
//       return NextResponse.redirect(
//         new URL(
//           role === "admin" ? ADMIN_DASHBOARD : USER_DASHBOARD,
//           request.url
//         )
//       )
//     }

//     if (pathname.startsWith("/admin") && role !== "admin") {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url))
//     }

//     if (pathname.startsWith("/my-account") && role !== "user") {
//       return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url))
//     }

//     return NextResponse.next()
//   } catch {
//     return NextResponse.redirect(
//       new URL(WEBSITE_LOGIN, request.url)
//     )
//   }
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/my-account/:path*",
//   ],
// }

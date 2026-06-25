import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { WEBSITE_LOGIN, USER_DASHBOARD } from "./routes/WebsiteRoute";
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute";
import { SHOP_OWNER_DASHBOARD } from "./routes/ShopOwnerPanelRoute";

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
  "shop owner":   SHOP_OWNER_DASHBOARD,
  laber:          "/labour/dashboard",
  "delivery boy": "/delivery/dashboard",
};


/* ─── Role → protected path prefix ─────────────────────────────── */
const ROLE_PREFIXES: Record<Role, string> = {
  admin:          "/admin",
  customer:       "/my-account",
  "shop owner":   "/shop",
  laber:          "/labour/dashboard",
  "delivery boy": "/delivery",
};


/* ─── Public paths anyone can visit (no auth needed) ────────────── */
const PUBLIC_PATHS = [
  "/labour",              // all labour listing page
  "/labour/profile",      // labour profile detail pages
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

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

  // Always allow public labour pages — no auth check at all
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  /* ── Unauthenticated user ── */
  if (!hasToken) {
    if (isAuthPath(pathname)) return NextResponse.next();

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

    if (!isValidRole(role)) {
      const res = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
      res.cookies.delete("access_token");
      return res;
    }

    /* ── Logged-in user visiting /auth/* → go to their dashboard ── */
    if (isAuthPath(pathname)) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
    }

    /* ── Block access to another role's protected area ── */
    const roleEntries = Object.entries(ROLE_PREFIXES) as [Role, string][];
    for (const [r, prefix] of roleEntries) {
      if (pathname.startsWith(prefix) && role !== r) {
        return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
      }
    }

    return NextResponse.next();

  } catch {
    const res = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.url));
    res.cookies.delete("access_token");
    return res;
  }
}

/* ─── Matcher ───────────────────────────────────────────────────── */
export const config = {
  matcher: [
    "/admin/:path*",
    "/my-account/:path*",
    "/shop/:path*",
    "/labour/:path*",       // still runs middleware on /labour/* ...
    "/delivery/:path*",
    "/auth/:path*",
  ],
};






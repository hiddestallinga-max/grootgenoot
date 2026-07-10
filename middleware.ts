import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Beschermt de regiekamer. Alleen wie de juiste sessie-cookie heeft mag erin.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login en logout moeten vrij toegankelijk zijn.
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("gg_admin")?.value;
  const geldig = cookie && cookie === process.env.ADMIN_SESSION_SECRET;

  if (!geldig) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

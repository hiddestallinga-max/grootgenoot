import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isGeldigSessieToken } from "@/lib/adminSession";

// Beschermt de regiekamer. Alleen wie een geldig, ondertekend sessietoken
// in de cookie heeft mag erin. Zie lib/adminSession.ts voor de details.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login en logout moeten vrij toegankelijk zijn.
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("gg_admin")?.value;
  const geldig = await isGeldigSessieToken(
    token,
    process.env.ADMIN_SESSION_SECRET,
  );

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

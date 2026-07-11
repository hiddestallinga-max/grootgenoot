import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { maakSessieToken, SESSIE_DUUR_SECONDEN } from "@/lib/adminSession";
import { isToegestaan, ipVan } from "@/lib/rateLimit";

// Vergelijk twee strings in constante tijd (via hashes van gelijke lengte),
// zodat een aanvaller niets kan afleiden uit de responstijd.
function veiligGelijk(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const wachtwoord = process.env.ADMIN_PASSWORD;

  if (!secret || !wachtwoord) {
    return NextResponse.json(
      { error: "Admin is nog niet geconfigureerd (env ontbreekt)." },
      { status: 500 },
    );
  }

  // Maximaal 5 pogingen per kwartier per IP tegen brute force.
  if (!isToegestaan(`login:${ipVan(request)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een kwartier opnieuw." },
      { status: 429 },
    );
  }

  let body: { wachtwoord?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  if (typeof body.wachtwoord !== "string" || !veiligGelijk(body.wachtwoord, wachtwoord)) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const token = await maakSessieToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("gg_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSIE_DUUR_SECONDEN,
  });
  return res;
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const wachtwoord = process.env.ADMIN_PASSWORD;

  if (!secret || !wachtwoord) {
    return NextResponse.json(
      { error: "Admin is nog niet geconfigureerd (env ontbreekt)." },
      { status: 500 },
    );
  }

  let body: { wachtwoord?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  if (body.wachtwoord !== wachtwoord) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("gg_admin", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dagen
  });
  return res;
}

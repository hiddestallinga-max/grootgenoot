import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { aanmeldingSchema } from "@/lib/validatie";
import { isToegestaan, ipVan } from "@/lib/rateLimit";

export async function POST(request: Request) {
  // Maximaal 5 aanmeldingen per 10 minuten per IP tegen spam-scripts.
  if (!isToegestaan(`aanmelding:${ipVan(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel aanmeldingen achter elkaar. Probeer het later opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  // Honeypot: het veld "website" is onzichtbaar voor mensen. Alleen bots
  // vullen het in. We doen dan alsof alles gelukt is, zonder op te slaan.
  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    (body as { website?: unknown }).website
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = aanmeldingSchema.safeParse(body);
  if (!parsed.success) {
    const eerste = parsed.error.issues[0]?.message ?? "Controleer je gegevens";
    return NextResponse.json({ error: eerste }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .insert(parsed.data);

  if (error) {
    // 23505 = unique_violation: dit e-mailadres is al aangemeld met deze rol.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Je bent al aangemeld met dit e-mailadres. We nemen contact met je op." },
        { status: 409 },
      );
    }
    console.error("Insert-fout aanmelding:", error.message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het opslaan. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isToegestaan, ipVan } from "@/lib/rateLimit";
import { stuurMail, eigenaarEmail } from "@/lib/email";

const contactSchema = z.object({
  naam: z.string().trim().min(1, "Vul je naam in").max(100),
  email: z.string().trim().email("Vul een geldig e-mailadres in").max(200),
  bericht: z.string().trim().min(1, "Schrijf een bericht").max(2000, "Je bericht is te lang (max 2000 tekens)"),
});

export async function POST(request: Request) {
  // Maximaal 5 berichten per 10 minuten per IP.
  if (!isToegestaan(`contact:${ipVan(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel berichten achter elkaar. Probeer het later opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  // Honeypot: alleen bots vullen het onzichtbare veld "website" in.
  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    (body as { website?: unknown }).website
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const eerste = parsed.error.issues[0]?.message ?? "Controleer je gegevens";
    return NextResponse.json({ error: eerste }, { status: 400 });
  }

  const { naam, email, bericht } = parsed.data;

  // Eerst opslaan (zodat er nooit een bericht verloren gaat), dan mailen.
  const { error } = await supabaseAdmin
    .from("berichten")
    .insert({ naam, email, bericht });

  if (error) {
    console.error("Insert-fout bericht:", error.message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het versturen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  await stuurMail({
    naar: eigenaarEmail(),
    onderwerp: `Nieuw bericht via de site — ${naam}`,
    tekst: `Naam: ${naam}\nE-mail: ${email}\n\n${bericht}`,
  });

  return NextResponse.json({ ok: true });
}

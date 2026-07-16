import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isToegestaan, ipVan } from "@/lib/rateLimit";
import { maakWijzigToken } from "@/lib/wijzigToken";
import { stuurMail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().email("Vul een geldig e-mailadres in").max(200),
});

export async function POST(request: Request) {
  // Streng gelimiteerd: 3 linkverzoeken per kwartier per IP.
  if (!isToegestaan(`wijziglink:${ipVan(request)}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het over een kwartier opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Controleer je gegevens" },
      { status: 400 },
    );
  }

  const geheim = process.env.ADMIN_SESSION_SECRET;
  const email = parsed.data.email;

  // We geven altijd hetzelfde antwoord, of het adres nu bekend is of niet.
  // Zo kan niemand raden welke e-mailadressen in ons bestand staan.
  const antwoord = NextResponse.json({ ok: true });

  if (!geheim) {
    console.error("ADMIN_SESSION_SECRET ontbreekt — kan geen wijziglink maken.");
    return antwoord;
  }

  const { data, error } = await supabaseAdmin
    .from("aanmeldingen")
    .select("id, rol, voornaam")
    .ilike("email", email)
    .is("verwijderd_op", null);

  if (error || !data || data.length === 0) return antwoord;

  const origin = new URL(request.url).origin;
  const regels: string[] = [];
  for (const rij of data) {
    const token = await maakWijzigToken(rij.id, geheim);
    const label =
      rij.rol === "hulpvrager" ? "je hulpvraag" : "je aanmelding als grootgenoot";
    regels.push(
      `Bekijk of wijzig ${label}:\n${origin}/groot-support/mijn-aanmelding/bewerken?token=${token}`,
    );
    if (rij.rol === "grootgenoot") {
      regels.push(
        `Geef je gewerkte uren door:\n${origin}/uren?token=${token}`,
      );
    }
  }

  await stuurMail({
    naar: email,
    onderwerp: "Je aanmelding bij Grootgenoot bekijken of wijzigen",
    tekst: `Beste ${data[0].voornaam},\n\n${regels.join("\n\n")}\n\nDeze link is 24 uur geldig. Niet zelf aangevraagd? Negeer deze mail dan gewoon.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`,
  });

  return antwoord;
}

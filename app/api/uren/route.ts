import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isToegestaan, ipVan } from "@/lib/rateLimit";
import { leesWijzigToken } from "@/lib/wijzigToken";
import { meldNieuweUren } from "@/lib/urenMelding";

// Grootgenoot dient gewerkte uren in via de beveiligde maillink (zelfde
// tokenmechanisme als "mijn aanmelding"). Goedkeuren gebeurt in de regiekamer.

const schema = z.object({
  token: z.string().min(10),
  koppeling_id: z.string().uuid(),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum"),
  minuten: z.number().int().min(15).max(720),
  km: z.number().min(0).max(1000).optional().default(0),
  omschrijving: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  if (!isToegestaan(`uren:${ipVan(request)}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
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
      { error: parsed.error.issues[0]?.message ?? "Controleer de invoer" },
      { status: 400 },
    );
  }

  const geheim = process.env.ADMIN_SESSION_SECRET;
  const grootgenootId = geheim
    ? await leesWijzigToken(parsed.data.token, geheim)
    : null;
  if (!grootgenootId) {
    return NextResponse.json(
      { error: "Deze link is verlopen. Vraag een nieuwe aan." },
      { status: 401 },
    );
  }

  // De koppeling moet echt van deze grootgenoot zijn.
  const { data: kop } = await supabaseAdmin
    .from("koppelingen")
    .select("id, actief")
    .eq("id", parsed.data.koppeling_id)
    .eq("grootgenoot_id", grootgenootId)
    .single();

  if (!kop || !kop.actief) {
    return NextResponse.json({ error: "Koppeling niet gevonden" }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from("uren").insert({
    koppeling_id: kop.id,
    datum: parsed.data.datum,
    minuten: parsed.data.minuten,
    km: parsed.data.km,
    omschrijving: parsed.data.omschrijving || null,
  });

  if (error) {
    console.error("Uren-fout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  await meldNieuweUren(kop.id, {
    datum: parsed.data.datum,
    minuten: parsed.data.minuten,
    km: parsed.data.km,
    omschrijving: parsed.data.omschrijving || null,
  });

  return NextResponse.json({ ok: true });
}

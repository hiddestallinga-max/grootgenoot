import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isToegestaan, ipVan } from "@/lib/rateLimit";

// Zoekt de actieve koppelingen van een grootgenoot op e-mailadres, zodat die
// direct (zonder maillink) uren kan doorgeven. De uren blijven altijd "wacht
// op goedkeuring" tot Hidde ze in de regiekamer goedkeurt.

const schema = z.object({
  email: z.string().trim().email("Vul een geldig e-mailadres in").max(200),
});

type KoppelingRij = {
  id: string;
  hulpvrager: { voornaam: string; achternaam: string } | null;
};

export async function POST(request: Request) {
  if (!isToegestaan(`uren-koppelingen:${ipVan(request)}`, 10, 15 * 60 * 1000)) {
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

  const { data: gg } = await supabaseAdmin
    .from("aanmeldingen")
    .select("id, voornaam")
    .ilike("email", parsed.data.email)
    .eq("rol", "grootgenoot")
    .maybeSingle();

  if (!gg) {
    return NextResponse.json({ voornaam: "", koppelingen: [] });
  }

  const { data } = await supabaseAdmin
    .from("koppelingen")
    .select(
      "id, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(voornaam, achternaam)",
    )
    .eq("grootgenoot_id", gg.id)
    .eq("actief", true);

  const rijen = (data as unknown as KoppelingRij[]) ?? [];
  const koppelingen = rijen.map((k) => ({
    id: k.id,
    naam: k.hulpvrager
      ? `${k.hulpvrager.voornaam} ${k.hulpvrager.achternaam}`
      : "Onbekend",
  }));

  return NextResponse.json({ voornaam: gg.voornaam, koppelingen });
}

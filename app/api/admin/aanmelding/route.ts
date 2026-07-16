import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Beheer van aanmeldingen in de regiekamer. "Verwijderen" is een soft delete:
// de aanmelding gaat naar de prullenbak (verwijderd_op wordt gezet) en kan
// altijd worden teruggezet. Pas "definitief" verwijdert echt (AVG); facturen
// blijven dan bewaard (fiscale bewaarplicht) doordat hun koppeling-verwijzing
// op null komt te staan.

const schema = z.object({
  id: z.string().uuid(),
  actie: z.enum(["verwijder", "herstel", "definitief"]).default("verwijder"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  const { id, actie } = parsed.data;

  if (actie === "definitief") {
    const { error } = await supabaseAdmin
      .from("aanmeldingen")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Aanmelding-verwijderfout:", error.message);
      return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const verwijderd_op = actie === "verwijder" ? new Date().toISOString() : null;
  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .update({ verwijderd_op })
    .eq("id", id);

  if (error) {
    console.error("Aanmelding-prullenbakfout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

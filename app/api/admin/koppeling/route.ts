import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Koppelingen beheren. "Verwijderen" is een soft delete (prullenbak);
// "definitief" verwijdert echt. Facturen blijven ook dan bewaard (fiscale
// bewaarplicht): hun koppeling-verwijzing komt op null te staan.

const schema = z.discriminatedUnion("actie", [
  z.object({
    actie: z.literal("nieuw"),
    hulpvrager_id: z.string().uuid(),
    grootgenoot_id: z.string().uuid(),
    uurtarief_cent: z.number().int().min(1000).max(10000),
  }),
  z.object({ actie: z.literal("verwijder"), id: z.string().uuid() }),
  z.object({ actie: z.literal("herstel"), id: z.string().uuid() }),
  z.object({ actie: z.literal("definitief"), id: z.string().uuid() }),
  z.object({
    actie: z.literal("tarief"),
    id: z.string().uuid(),
    uurtarief_cent: z.number().int().min(1000).max(10000),
  }),
]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Controleer de invoer" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.actie === "nieuw") {
    const { error } = await supabaseAdmin.from("koppelingen").insert({
      hulpvrager_id: d.hulpvrager_id,
      grootgenoot_id: d.grootgenoot_id,
      uurtarief_cent: d.uurtarief_cent,
    });
    if (error) {
      console.error("Koppeling-fout:", error.message);
      return NextResponse.json({ error: "Aanmaken mislukt" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (d.actie === "tarief") {
    // Nieuw uurtarief afgesproken met de grootgenoot. Geldt alleen voor
    // toekomstige facturen: bestaande facturen zijn een vaste momentopname
    // (snapshot) en veranderen niet mee.
    const { error } = await supabaseAdmin
      .from("koppelingen")
      .update({ uurtarief_cent: d.uurtarief_cent })
      .eq("id", d.id);
    if (error) {
      console.error("Tarief-fout:", error.message);
      return NextResponse.json({ error: "Tarief opslaan mislukt" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (d.actie === "definitief") {
    // Uren verdwijnen mee (cascade); facturen blijven staan met koppeling null.
    const { error } = await supabaseAdmin
      .from("koppelingen")
      .delete()
      .eq("id", d.id);
    if (error) {
      console.error("Koppeling-verwijderfout:", error.message);
      return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const naarPrullenbak = d.actie === "verwijder";
  const { error } = await supabaseAdmin
    .from("koppelingen")
    .update({
      verwijderd_op: naarPrullenbak ? new Date().toISOString() : null,
      actief: !naarPrullenbak,
    })
    .eq("id", d.id);
  if (error) {
    console.error("Koppeling-prullenbakfout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.discriminatedUnion("actie", [
  z.object({
    actie: z.literal("nieuw"),
    hulpvrager_id: z.string().uuid(),
    grootgenoot_id: z.string().uuid(),
    uurtarief_cent: z.number().int().min(1000).max(10000),
    service_pct: z.number().min(0).max(50).default(18),
  }),
  z.object({ actie: z.literal("verwijder"), id: z.string().uuid() }),
  z.object({
    actie: z.literal("service"),
    id: z.string().uuid(),
    service_pct: z.number().min(0).max(50),
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
      service_pct: d.service_pct,
    });
    if (error) {
      console.error("Koppeling-fout:", error.message);
      return NextResponse.json({ error: "Aanmaken mislukt" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (d.actie === "verwijder") {
    // Uren en facturen van deze koppeling verdwijnen mee (on delete cascade).
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

  const { error } = await supabaseAdmin
    .from("koppelingen")
    .update({ service_pct: d.service_pct })
    .eq("id", d.id);
  if (error) {
    console.error("Service-pct-fout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

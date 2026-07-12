import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Verwijdert een aanmelding definitief (AVG). Koppelingen, uren en
// factuurhistorie van deze persoon verdwijnen mee (on delete cascade).

const schema = z.object({ id: z.string().uuid() });

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

  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Aanmelding-verwijderfout:", error.message);
    return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

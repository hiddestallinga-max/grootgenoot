import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Markeert een Stripe-intake als verwerkt. We verwijderen de rij dan meteen:
// de betaalgegevens (waaronder het IBAN) zijn dan in Stripe gezet en horen
// niet langer in onze eigen database te blijven staan (dataminimalisatie).

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
    .from("stripe_intake")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Intake-verwerkfout:", error.message);
    return NextResponse.json({ error: "Verwerken mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

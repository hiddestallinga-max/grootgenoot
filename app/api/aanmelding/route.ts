import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { aanmeldingSchema } from "@/lib/validatie";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
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
    console.error("Insert-fout aanmelding:", error.message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het opslaan. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

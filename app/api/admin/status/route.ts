import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STATUS_VOLGORDE, type Status } from "@/lib/types";

export async function POST(request: Request) {
  let body: { id?: string; status?: string; notitie?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id ontbreekt" }, { status: 400 });
  }

  const update: { status?: Status; notitie?: string } = {};

  if (body.status !== undefined) {
    if (!STATUS_VOLGORDE.includes(body.status as Status)) {
      return NextResponse.json({ error: "Onbekende status" }, { status: 400 });
    }
    update.status = body.status as Status;
  }
  if (body.notitie !== undefined) {
    update.notitie = body.notitie;
  }

  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .update(update)
    .eq("id", body.id);

  if (error) {
    console.error("Update-fout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

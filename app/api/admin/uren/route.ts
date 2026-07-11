import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["goedgekeurd", "afgekeurd"]),
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

  const { error } = await supabaseAdmin
    .from("uren")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("status", "ingediend");

  if (error) {
    console.error("Uren-statusfout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

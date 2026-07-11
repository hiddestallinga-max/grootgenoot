import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  hulpvrager_id: z.string().uuid(),
  grootgenoot_id: z.string().uuid(),
  uurtarief_cent: z.number().int().min(1000).max(10000),
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
    return NextResponse.json({ error: "Controleer de invoer" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("koppelingen").insert(parsed.data);
  if (error) {
    console.error("Koppeling-fout:", error.message);
    return NextResponse.json({ error: "Aanmaken mislukt" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

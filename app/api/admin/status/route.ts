import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STATUS_VOLGORDE, type Status } from "@/lib/types";

const updateSchema = z
  .object({
    id: z.string().uuid("Ongeldig id"),
    status: z
      .enum(STATUS_VOLGORDE as [Status, ...Status[]], {
        errorMap: () => ({ message: "Onbekende status" }),
      })
      .optional(),
    notitie: z.string().max(2000, "Notitie is te lang (max 2000 tekens)").optional(),
  })
  .refine((d) => d.status !== undefined || d.notitie !== undefined, {
    message: "Niets om op te slaan",
  });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const eerste = parsed.error.issues[0]?.message ?? "Ongeldige aanvraag";
    return NextResponse.json({ error: eerste }, { status: 400 });
  }

  const { id, status, notitie } = parsed.data;
  const update: { status?: Status; notitie?: string } = {};
  if (status !== undefined) update.status = status;
  if (notitie !== undefined) update.notitie = notitie;

  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("Update-fout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

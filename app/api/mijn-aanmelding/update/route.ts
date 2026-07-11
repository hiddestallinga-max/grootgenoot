import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isToegestaan, ipVan } from "@/lib/rateLimit";
import { leesWijzigToken } from "@/lib/wijzigToken";
import { CATEGORIEEN } from "@/lib/types";

const categorieSet = new Set<string>(CATEGORIEEN);

const schema = z.object({
  token: z.string().min(10),
  actie: z.enum(["opslaan", "afmelden"]),
  telefoon: z.string().trim().max(30).optional().or(z.literal("")),
  postcode: z.string().trim().max(10).optional().or(z.literal("")),
  categorieen: z
    .array(z.string())
    .default([])
    .refine((arr) => arr.every((c) => categorieSet.has(c)), {
      message: "Onbekende categorie",
    }),
  urgentie: z.enum(["laag", "gemiddeld", "hoog"]).optional(),
  beschikbaarheid: z.string().trim().max(500).optional().or(z.literal("")),
  toelichting: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  if (!isToegestaan(`wijzig:${ipVan(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Controleer je gegevens" },
      { status: 400 },
    );
  }

  const geheim = process.env.ADMIN_SESSION_SECRET;
  const id = geheim ? await leesWijzigToken(parsed.data.token, geheim) : null;
  if (!id) {
    return NextResponse.json(
      { error: "Deze link is verlopen. Vraag een nieuwe aan." },
      { status: 401 },
    );
  }

  if (parsed.data.actie === "afmelden") {
    const { error } = await supabaseAdmin
      .from("aanmeldingen")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Afmeld-fout:", error.message);
      return NextResponse.json({ error: "Afmelden mislukt" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Welke rol heeft deze aanmelding? (urgentie is alleen voor hulpvragers)
  const { data: rij } = await supabaseAdmin
    .from("aanmeldingen")
    .select("rol")
    .eq("id", id)
    .single();

  const d = parsed.data;
  const update = {
    telefoon: d.telefoon || null,
    postcode: d.postcode || null,
    categorieen: d.categorieen,
    urgentie: rij?.rol === "hulpvrager" ? (d.urgentie ?? null) : null,
    beschikbaarheid: d.beschikbaarheid || null,
    toelichting: d.toelichting || null,
  };

  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("Wijzig-fout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

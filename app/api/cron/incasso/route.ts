import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStripeGeconfigureerd } from "@/lib/stripe";
import { voerIncassoUit } from "@/lib/incasso";

// Dagelijkse cron (zie vercel.json): voert alle aangekondigde incasso's uit
// waarvan de aangekondigde datum is bereikt. Vercel stuurt automatisch
// "Authorization: Bearer <CRON_SECRET>" mee als die env-variabele bestaat.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const geheim = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!geheim || auth !== `Bearer ${geheim}`) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 401 });
  }
  if (!isStripeGeconfigureerd()) {
    return NextResponse.json(
      { error: "Stripe is niet geconfigureerd" },
      { status: 500 },
    );
  }

  const vandaag = new Date().toISOString().slice(0, 10);
  const { data: facturen, error } = await supabaseAdmin
    .from("facturen")
    .select("id")
    .eq("status", "aangekondigd")
    .lte("incasso_vanaf", vandaag);

  if (error) {
    console.error("Cron-incasso queryfout:", error.message);
    return NextResponse.json({ error: "Databasefout" }, { status: 500 });
  }

  const resultaten: { id: string; ok: boolean; fout?: string }[] = [];
  for (const f of facturen ?? []) {
    const uitkomst = await voerIncassoUit(f.id);
    resultaten.push({ id: f.id, ...uitkomst });
  }

  return NextResponse.json({
    verwerkt: resultaten.length,
    gelukt: resultaten.filter((r) => r.ok).length,
    resultaten,
  });
}

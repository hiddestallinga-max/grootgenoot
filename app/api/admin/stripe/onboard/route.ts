import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe, isStripeGeconfigureerd } from "@/lib/stripe";
import { stuurMail } from "@/lib/email";

// Maakt (of hergebruikt) een Stripe Express-account voor een grootgenoot en
// mailt een onboarding-link. Daar regelt de zzp'er identiteit en bankrekening
// rechtstreeks met Stripe; wij zien of bewaren die gegevens nooit.

const schema = z.object({ aanmelding_id: z.string().uuid() });

export async function POST(request: Request) {
  if (!isStripeGeconfigureerd()) {
    return NextResponse.json(
      { error: "Stripe is nog niet geconfigureerd (STRIPE_SECRET_KEY ontbreekt)." },
      { status: 500 },
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
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const { data: gg } = await supabaseAdmin
    .from("aanmeldingen")
    .select("id, rol, voornaam, achternaam, email, stripe_account_id")
    .eq("id", parsed.data.aanmelding_id)
    .single();

  if (!gg || gg.rol !== "grootgenoot") {
    return NextResponse.json({ error: "Grootgenoot niet gevonden" }, { status: 404 });
  }

  try {
    let accountId = gg.stripe_account_id as string | null;
    if (!accountId) {
      const account = await stripe().accounts.create({
        type: "express",
        country: "NL",
        email: gg.email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
          sepa_debit_payments: { requested: true },
        },
        business_profile: {
          product_description:
            "Hulp en gezelschap voor ouderen, bemiddeld via Grootgenoot",
        },
        metadata: { aanmelding_id: gg.id },
      });
      accountId = account.id;
      await supabaseAdmin
        .from("aanmeldingen")
        .update({ stripe_account_id: accountId })
        .eq("id", gg.id);
    }

    const origin = new URL(request.url).origin;
    const link = await stripe().accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/stripe/klaar?vernieuwd=1`,
      return_url: `${origin}/stripe/klaar`,
      type: "account_onboarding",
    });

    await stuurMail({
      naar: gg.email,
      onderwerp: "Regel je uitbetalingen bij Grootgenoot",
      tekst: `Beste ${gg.voornaam},\n\nOm je uren uitbetaald te krijgen, vragen we je eenmalig je gegevens en bankrekening te bevestigen bij Stripe, onze betaalpartner. Dat duurt ongeveer 10 minuten:\n\n${link.url}\n\nDeze link is enkele dagen geldig. Grootgenoot ziet je bankgegevens niet; die blijven bij Stripe.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe onboarding-fout:", err);
    const boodschap = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json(
      { error: `Stripe-onboarding mislukt: ${boodschap}` },
      { status: 500 },
    );
  }
}

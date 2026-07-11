import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe, isStripeGeconfigureerd } from "@/lib/stripe";
import { stuurMail } from "@/lib/email";

// Maakt een Stripe-klant voor een hulpvrager en mailt een beveiligde link
// waarmee die eenmalig een SEPA-incassomachtiging afgeeft (Stripe Checkout).

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

  const { data: hv } = await supabaseAdmin
    .from("aanmeldingen")
    .select("id, rol, voornaam, achternaam, email, stripe_customer_id")
    .eq("id", parsed.data.aanmelding_id)
    .single();

  if (!hv || hv.rol !== "hulpvrager") {
    return NextResponse.json({ error: "Hulpvrager niet gevonden" }, { status: 404 });
  }

  try {
    let customerId = hv.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: hv.email,
        name: `${hv.voornaam} ${hv.achternaam}`,
        metadata: { aanmelding_id: hv.id },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from("aanmeldingen")
        .update({ stripe_customer_id: customerId })
        .eq("id", hv.id);
    }

    const origin = new URL(request.url).origin;
    const session = await stripe().checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      payment_method_types: ["sepa_debit"],
      locale: "nl",
      success_url: `${origin}/stripe/machtiging-klaar`,
      cancel_url: `${origin}/`,
      metadata: { aanmelding_id: hv.id },
    });

    await stuurMail({
      naar: hv.email,
      onderwerp: "Machtiging voor je maandelijkse betaling aan Grootgenoot",
      tekst: `Beste ${hv.voornaam},\n\nVia onderstaande beveiligde link geeft u eenmalig toestemming om de hulp van uw grootgenoot maandelijks automatisch af te schrijven. U ontvangt vooraf altijd een overzicht van de uren, zodat u nooit voor verrassingen staat.\n\n${session.url}\n\nDe betaling loopt via Stripe, onze betaalpartner. Vragen? Bel of mail ons gerust.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe machtiging-fout:", err);
    const boodschap = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json(
      { error: `Machtigingslink mislukt: ${boodschap}` },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { stuurMail, eigenaarEmail } from "@/lib/email";

// Stripe meldt hier wat er gebeurt: onboarding afgerond, machtiging gezet,
// betaling gelukt of mislukt. Configureer dit endpoint in het Stripe-dashboard
// (Developers > Webhooks) en zet de signing secret in STRIPE_WEBHOOK_SECRET.

export async function POST(request: Request) {
  // Twee mogelijke secrets: één voor events van je eigen account (betalingen,
  // machtigingen) en één voor events van gekoppelde accounts (onboarding).
  const geheimen = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
  ].filter((g): g is string => Boolean(g));
  const handtekening = request.headers.get("stripe-signature");
  if (geheimen.length === 0 || !handtekening) {
    return NextResponse.json({ error: "Webhook niet geconfigureerd" }, { status: 400 });
  }

  const rauw = await request.text();
  let event: Stripe.Event | null = null;
  for (const geheim of geheimen) {
    try {
      event = await stripe().webhooks.constructEventAsync(rauw, handtekening, geheim);
      break;
    } catch {
      // probeer het volgende secret
    }
  }
  if (!event) {
    console.error("Webhook-handtekening ongeldig");
    return NextResponse.json({ error: "Ongeldige handtekening" }, { status: 400 });
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object;
      const klaar = Boolean(account.details_submitted && account.payouts_enabled);
      if (klaar) {
        await supabaseAdmin
          .from("aanmeldingen")
          .update({ stripe_onboarded: true })
          .eq("stripe_account_id", account.id);
      }
      break;
    }

    case "checkout.session.completed": {
      const sessie = event.data.object;
      if (sessie.mode === "setup" && typeof sessie.customer === "string") {
        await supabaseAdmin
          .from("aanmeldingen")
          .update({ stripe_machtiging: true })
          .eq("stripe_customer_id", sessie.customer);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const intent = event.data.object;
      const factuurId = intent.metadata?.factuur_id;
      if (factuurId) {
        await supabaseAdmin
          .from("facturen")
          .update({ status: "betaald" })
          .eq("id", factuurId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      const factuurId = intent.metadata?.factuur_id;
      if (factuurId) {
        await supabaseAdmin
          .from("facturen")
          .update({ status: "mislukt" })
          .eq("id", factuurId);
        // Gefactureerde uren terugzetten zodat een nieuwe poging mogelijk is.
        const { data: factuur } = await supabaseAdmin
          .from("facturen")
          .select("koppeling_id, periode, totaal_cent")
          .eq("id", factuurId)
          .single();
        if (factuur) {
          await supabaseAdmin
            .from("uren")
            .update({ status: "goedgekeurd" })
            .eq("koppeling_id", factuur.koppeling_id)
            .eq("status", "gefactureerd");
        }
        await stuurMail({
          naar: eigenaarEmail(),
          onderwerp: "Let op: incasso mislukt",
          tekst: `Een incasso is mislukt (factuur ${factuurId}). De uren staan weer op goedgekeurd; neem contact op met de cliënt en start de incasso opnieuw vanuit de regiekamer.`,
        });
      }
      break;
    }
  }

  return NextResponse.json({ ontvangen: true });
}

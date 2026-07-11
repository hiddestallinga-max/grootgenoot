import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { stuurMail, eigenaarEmail } from "@/lib/email";

// Stripe meldt hier wat er gebeurt: onboarding afgerond, machtiging gezet,
// betaling gelukt of mislukt. Configureer dit endpoint in het Stripe-dashboard
// (Developers > Webhooks) en zet de signing secret in STRIPE_WEBHOOK_SECRET.

export async function POST(request: Request) {
  const geheim = process.env.STRIPE_WEBHOOK_SECRET;
  const handtekening = request.headers.get("stripe-signature");
  if (!geheim || !handtekening) {
    return NextResponse.json({ error: "Webhook niet geconfigureerd" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rauw = await request.text();
    event = await stripe().webhooks.constructEventAsync(rauw, handtekening, geheim);
  } catch (err) {
    console.error("Webhook-handtekening ongeldig:", err);
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

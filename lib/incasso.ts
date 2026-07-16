import { supabaseAdmin } from "./supabaseAdmin";
import { stripe, euroTekst } from "./stripe";
import { stuurMail, eigenaarEmail } from "./email";

// Uitvoeren van een eerder aangekondigde incasso. De aankondiging (factuur
// mailen met concrete afschrijfdatum) gebeurt in de regiekamer; de echte
// afschrijving gebeurt hier, aangeroepen door de dagelijkse cron zodra de
// aangekondigde datum is bereikt. Zo krijgt de klant het overzicht echt
// vooraf (SEPA-prenotificatie) en is er tijd om te reageren.

/** Aantal dagen tussen de factuurmail en de daadwerkelijke afschrijving. */
export const INCASSO_WACHT_DAGEN = 5;

/** De datum (YYYY-MM-DD) waarop een vandaag aangekondigde incasso mag lopen. */
export function incassoVanafDatum(): string {
  return new Date(Date.now() + INCASSO_WACHT_DAGEN * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export function datumTekst(isoDatum: string): string {
  const d = new Date(isoDatum);
  if (Number.isNaN(d.getTime())) return isoDatum;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type PersoonKort = {
  voornaam: string;
  achternaam: string;
  email: string;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
};

type FactuurRij = {
  id: string;
  periode: string;
  totaal_cent: number;
  service_cent: number;
  status: string;
  snapshot: { nummer?: string } | null;
  koppeling: {
    id: string;
    hulpvrager: PersoonKort | null;
    grootgenoot: PersoonKort | null;
  } | null;
};

/**
 * Voert de afschrijving voor één aangekondigde factuur uit.
 * Bij falen: uren van deze factuur terug naar 'goedgekeurd' en Hidde gemaild.
 */
export async function voerIncassoUit(
  factuurId: string,
): Promise<{ ok: boolean; fout?: string }> {
  const { data } = await supabaseAdmin
    .from("facturen")
    .select(
      "id, periode, totaal_cent, service_cent, status, snapshot, koppeling:koppelingen!facturen_koppeling_id_fkey(id, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(voornaam, achternaam, email, stripe_account_id, stripe_customer_id), grootgenoot:aanmeldingen!koppelingen_grootgenoot_id_fkey(voornaam, achternaam, email, stripe_account_id, stripe_customer_id))",
    )
    .eq("id", factuurId)
    .single();

  const factuur = data as unknown as FactuurRij | null;
  if (!factuur) return { ok: false, fout: "Factuur niet gevonden" };
  if (factuur.status !== "aangekondigd") {
    return { ok: false, fout: `Factuur heeft status '${factuur.status}'` };
  }

  const hulpvrager = factuur.koppeling?.hulpvrager ?? null;
  const grootgenoot = factuur.koppeling?.grootgenoot ?? null;
  const nummer = factuur.snapshot?.nummer ?? factuurId;

  async function faal(reden: string): Promise<{ ok: false; fout: string }> {
    await supabaseAdmin
      .from("facturen")
      .update({ status: "mislukt" })
      .eq("id", factuurId);
    await supabaseAdmin
      .from("uren")
      .update({ status: "goedgekeurd" })
      .eq("factuur_id", factuurId)
      .eq("status", "gefactureerd");
    await stuurMail({
      naar: eigenaarEmail(),
      onderwerp: `Let op: incasso niet gestart (factuur ${nummer})`,
      tekst: `De aangekondigde incasso voor factuur ${nummer} (${euroTekst(factuur!.totaal_cent)}) kon niet worden gestart.\n\nReden: ${reden}\n\nDe uren staan weer op 'goedgekeurd'. Los het op en verstuur de factuur opnieuw vanuit de regiekamer: /admin`,
    });
    return { ok: false, fout: reden };
  }

  if (!hulpvrager?.stripe_customer_id) {
    return faal("De hulpvrager heeft geen Stripe-klant (customer_id ontbreekt).");
  }
  if (!grootgenoot?.stripe_account_id) {
    return faal("De grootgenoot heeft geen Stripe-account (account_id ontbreekt).");
  }

  try {
    const betaalmethoden = await stripe().paymentMethods.list({
      customer: hulpvrager.stripe_customer_id,
      type: "sepa_debit",
    });
    const betaalmethode = betaalmethoden.data[0];
    if (!betaalmethode) {
      return faal("Geen SEPA-machtiging gevonden bij Stripe.");
    }

    const intent = await stripe().paymentIntents.create(
      {
        amount: factuur.totaal_cent,
        currency: "eur",
        customer: hulpvrager.stripe_customer_id,
        payment_method: betaalmethode.id,
        payment_method_types: ["sepa_debit"],
        off_session: true,
        confirm: true,
        application_fee_amount: factuur.service_cent,
        transfer_data: { destination: grootgenoot.stripe_account_id },
        description: `Grootgenoot, hulp ${factuur.periode} (factuur ${nummer})`,
        metadata: { factuur_id: factuur.id, koppeling_id: factuur.koppeling?.id ?? "" },
      },
      // Idempotent: ook bij een dubbele aanroep ontstaat er maar één afschrijving.
      { idempotencyKey: `incasso-${factuur.id}` },
    );

    await supabaseAdmin
      .from("facturen")
      .update({ status: "in_behandeling", stripe_payment_intent_id: intent.id })
      .eq("id", factuur.id);

    return { ok: true };
  } catch (err) {
    console.error("Incasso-uitvoerfout:", err);
    return faal(err instanceof Error ? err.message : "Onbekende fout bij Stripe");
  }
}

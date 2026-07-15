import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe, isStripeGeconfigureerd, euroTekst } from "@/lib/stripe";
import { stuurMail, eigenaarEmail } from "@/lib/email";
import {
  reiskostenCent,
  REISKOSTEN_CENT_PER_KM,
  SERVICE_CENT_PER_UUR,
} from "@/lib/tarieven";
import { genereerFactuurPdf, type FactuurSnapshot } from "@/lib/factuurPdf";

// Start de maandincasso voor één koppeling: telt de goedgekeurde uren op,
// mailt de cliënt het overzicht en maakt één SEPA-incasso aan die Stripe
// automatisch splitst: het uurdeel naar de grootgenoot (destination),
// de service naar Grootgenoot (application fee). Het geld van de
// grootgenoot komt dus nooit op onze rekening.

const schema = z.object({ koppeling_id: z.string().uuid() });

type Persoon = {
  id: string;
  voornaam: string;
  achternaam: string;
  email: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  stripe_customer_id: string | null;
  stripe_machtiging: boolean;
  kvk: string | null;
  btw_id: string | null;
  werkvorm: string | null;
};

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

  const { data: kop } = await supabaseAdmin
    .from("koppelingen")
    .select(
      "id, uurtarief_cent, actief, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(*), grootgenoot:aanmeldingen!koppelingen_grootgenoot_id_fkey(*)",
    )
    .eq("id", parsed.data.koppeling_id)
    .single();

  if (!kop) {
    return NextResponse.json({ error: "Koppeling niet gevonden" }, { status: 404 });
  }

  const hulpvrager = kop.hulpvrager as unknown as Persoon;
  const grootgenoot = kop.grootgenoot as unknown as Persoon;

  if (!grootgenoot.stripe_account_id || !grootgenoot.stripe_onboarded) {
    return NextResponse.json(
      { error: "De grootgenoot heeft de Stripe-onboarding nog niet afgerond." },
      { status: 400 },
    );
  }
  if (!hulpvrager.stripe_customer_id || !hulpvrager.stripe_machtiging) {
    return NextResponse.json(
      { error: "De hulpvrager heeft nog geen incassomachtiging afgegeven." },
      { status: 400 },
    );
  }

  const { data: uren } = await supabaseAdmin
    .from("uren")
    .select("id, datum, minuten, km, omschrijving")
    .eq("koppeling_id", kop.id)
    .eq("status", "goedgekeurd")
    .order("datum");

  if (!uren || uren.length === 0) {
    return NextResponse.json(
      { error: "Geen goedgekeurde uren om te factureren." },
      { status: 400 },
    );
  }

  const totaalMinuten = uren.reduce((som, u) => som + u.minuten, 0);
  const totaalUren = totaalMinuten / 60;
  const totaalKm = uren.reduce((som, u) => som + Number(u.km ?? 0), 0);
  const urenCent = Math.round(totaalUren * kop.uurtarief_cent);
  // Vaste servicebijdrage van € 4,00 per gewerkt uur (geen percentage).
  const serviceCent = Math.round(totaalUren * SERVICE_CENT_PER_UUR);
  // Reiskostenvergoeding gaat volledig naar de grootgenoot: geen service erover.
  const reisCent = reiskostenCent(totaalKm);
  const totaalCent = urenCent + serviceCent + reisCent;
  const periode = new Date().toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  try {
    // Opgeslagen SEPA-betaalmethode van de cliënt ophalen.
    const betaalmethoden = await stripe().paymentMethods.list({
      customer: hulpvrager.stripe_customer_id,
      type: "sepa_debit",
    });
    const betaalmethode = betaalmethoden.data[0];
    if (!betaalmethode) {
      return NextResponse.json(
        { error: "Geen SEPA-machtiging gevonden bij Stripe." },
        { status: 400 },
      );
    }

    const { data: factuur, error: factuurFout } = await supabaseAdmin
      .from("facturen")
      .insert({
        koppeling_id: kop.id,
        periode,
        totaal_cent: totaalCent,
        service_cent: serviceCent,
        status: "in_behandeling",
      })
      .select("id, nummer")
      .single();
    if (factuurFout || !factuur) throw new Error(factuurFout?.message);

    const nummerWeergave = `${new Date().getFullYear()}-${String(
      (factuur as { nummer: number }).nummer,
    ).padStart(4, "0")}`;
    const snapshot: FactuurSnapshot = {
      nummer: nummerWeergave,
      datum: new Date().toISOString(),
      periode,
      klantNaam: `${hulpvrager.voornaam} ${hulpvrager.achternaam}`,
      grootgenootNaam: `${grootgenoot.voornaam} ${grootgenoot.achternaam}`,
      uurtariefCent: kop.uurtarief_cent,
      regels: uren.map((u) => ({
        datum: u.datum,
        minuten: u.minuten,
        km: Number(u.km ?? 0),
        omschrijving: u.omschrijving ?? null,
      })),
      totaalUren,
      totaalKm,
      urenCent,
      serviceCent,
      reisCent,
      totaalCent,
      grootgenootKvk: grootgenoot.werkvorm === "zzp" ? grootgenoot.kvk ?? null : null,
      grootgenootBtw: grootgenoot.werkvorm === "zzp" ? grootgenoot.btw_id ?? null : null,
    };
    await supabaseAdmin.from("facturen").update({ snapshot }).eq("id", factuur.id);
    const factuurPdf = await genereerFactuurPdf(snapshot);

    const intent = await stripe().paymentIntents.create({
      amount: totaalCent,
      currency: "eur",
      customer: hulpvrager.stripe_customer_id,
      payment_method: betaalmethode.id,
      payment_method_types: ["sepa_debit"],
      off_session: true,
      confirm: true,
      application_fee_amount: serviceCent,
      transfer_data: { destination: grootgenoot.stripe_account_id },
      description: `Grootgenoot, hulp ${periode}`,
      metadata: { factuur_id: factuur.id, koppeling_id: kop.id },
    });

    await supabaseAdmin
      .from("facturen")
      .update({ stripe_payment_intent_id: intent.id })
      .eq("id", factuur.id);

    const urenIds = uren.map((u) => u.id);
    await supabaseAdmin
      .from("uren")
      .update({ status: "gefactureerd" })
      .in("id", urenIds);

    const regels = uren
      .map(
        (u) =>
          `- ${new Date(u.datum).toLocaleDateString("nl-NL")}: ${(u.minuten / 60).toLocaleString("nl-NL")} uur${Number(u.km ?? 0) > 0 ? `, ${Number(u.km).toLocaleString("nl-NL")} km` : ""}${u.omschrijving ? ` (${u.omschrijving})` : ""}`,
      )
      .join("\n");

    const reisRegel =
      totaalKm > 0
        ? `\nReiskosten (${totaalKm.toLocaleString("nl-NL")} km x ${euroTekst(REISKOSTEN_CENT_PER_KM)}): ${euroTekst(reisCent)}`
        : "";

    const overzicht = `Uren van ${grootgenoot.voornaam} ${grootgenoot.achternaam} (${periode}):\n${regels}\n\nUren (${totaalUren.toLocaleString("nl-NL")} uur x ${euroTekst(kop.uurtarief_cent)}): ${euroTekst(urenCent)}\nService (${totaalUren.toLocaleString("nl-NL")} uur x ${euroTekst(SERVICE_CENT_PER_UUR)}): ${euroTekst(serviceCent)}${reisRegel}\nTotaal: ${euroTekst(totaalCent)}`;

    await Promise.allSettled([
      stuurMail({
        naar: hulpvrager.email,
        onderwerp: `Uw factuur van Grootgenoot (${periode})`,
        tekst: `Beste ${hulpvrager.voornaam},\n\nIn de bijlage vindt u uw factuur voor ${periode} (factuurnummer ${nummerWeergave}). Het totaalbedrag is ${euroTekst(totaalCent)}.\n\nDit bedrag wordt binnen enkele dagen automatisch van uw rekening afgeschreven via uw incassomachtiging. Klopt er iets niet? Laat het ons direct weten.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`,
        bijlagen: [{ bestandsnaam: `factuur-${nummerWeergave}.pdf`, inhoud: factuurPdf }],
      }),
      stuurMail({
        naar: grootgenoot.email,
        onderwerp: `Je uitbetaling van Grootgenoot is onderweg (${periode})`,
        tekst: `Beste ${grootgenoot.voornaam},\n\n${overzicht}\n\nJouw deel (${euroTekst(urenCent + reisCent)}${reisCent > 0 ? `, inclusief ${euroTekst(reisCent)} reiskosten` : ""}) wordt na verwerking door Stripe rechtstreeks op je rekening gestort.\n\nHartelijke groet,\nHidde van Grootgenoot`,
      }),
      stuurMail({
        naar: eigenaarEmail(),
        onderwerp: `Incasso gestart: ${hulpvrager.achternaam} / ${grootgenoot.achternaam} (${euroTekst(totaalCent)})`,
        tekst: overzicht,
      }),
    ]);

    return NextResponse.json({ ok: true, totaal_cent: totaalCent });
  } catch (err) {
    console.error("Incasso-fout:", err);
    const boodschap = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json(
      { error: `Incasso mislukt: ${boodschap}` },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe, isStripeGeconfigureerd, euroTekst } from "@/lib/stripe";
import { stuurMail, eigenaarEmail } from "@/lib/email";
import { genereerCreditnotaPdf } from "@/lib/factuurPdf";

// Corrigeert een eerdere factuur: maakt een Stripe-terugbetaling aan (heel of
// deels), legt een creditnota vast en mailt de klant de creditnota als PDF.

const schema = z.object({
  factuur_id: z.string().uuid(),
  reden: z.string().trim().max(300).optional().or(z.literal("")),
  bedrag_cent: z.number().int().positive().optional(),
});

type Hulpvrager = { voornaam: string; achternaam: string; email: string } | null;

export async function POST(request: Request) {
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

  const { data: factuur } = await supabaseAdmin
    .from("facturen")
    .select(
      "id, periode, totaal_cent, stripe_payment_intent_id, gecrediteerd, snapshot, koppeling:koppelingen!facturen_koppeling_id_fkey(hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(voornaam, achternaam, email))",
    )
    .eq("id", parsed.data.factuur_id)
    .single();

  if (!factuur) {
    return NextResponse.json({ error: "Factuur niet gevonden" }, { status: 404 });
  }

  const bedrag = parsed.data.bedrag_cent ?? factuur.totaal_cent;
  if (bedrag > factuur.totaal_cent) {
    return NextResponse.json(
      { error: "Het creditbedrag kan niet hoger zijn dan het factuurbedrag." },
      { status: 400 },
    );
  }

  const kop = factuur.koppeling as unknown as { hulpvrager: Hulpvrager } | null;
  const hv = kop?.hulpvrager ?? null;

  // Stripe-terugbetaling (als er een betaling aan hing).
  let refundId: string | null = null;
  if (factuur.stripe_payment_intent_id) {
    if (!isStripeGeconfigureerd()) {
      return NextResponse.json(
        { error: "Stripe is niet geconfigureerd, kan niet terugbetalen." },
        { status: 500 },
      );
    }
    try {
      const refund = await stripe().refunds.create({
        payment_intent: factuur.stripe_payment_intent_id,
        amount: bedrag,
        // Haal het uitbetaalde deel naar rato terug bij de grootgenoot en
        // betaal de servicebijdrage naar rato terug. Zonder deze twee opties
        // zou het volledige refundbedrag uit het platformsaldo komen terwijl
        // de grootgenoot zijn uitbetaling houdt.
        reverse_transfer: true,
        refund_application_fee: true,
      });
      refundId = refund.id;
    } catch (err) {
      console.error("Terugbetaling-fout:", err);
      const boodschap = err instanceof Error ? err.message : "Onbekende fout";
      return NextResponse.json(
        { error: `Terugbetalen mislukt: ${boodschap}` },
        { status: 500 },
      );
    }
  }

  const origineelNummer = (factuur.snapshot as { nummer?: string } | null)?.nummer ?? "onbekend";

  const { data: credit, error: creditFout } = await supabaseAdmin
    .from("creditnotas")
    .insert({
      factuur_id: factuur.id,
      bedrag_cent: bedrag,
      reden: parsed.data.reden || null,
      stripe_refund_id: refundId,
    })
    .select("id, nummer")
    .single();
  if (creditFout || !credit) {
    return NextResponse.json({ error: "Creditnota opslaan mislukt" }, { status: 500 });
  }

  const creditNummer = `C${new Date().getFullYear()}-${String(
    (credit as { nummer: number }).nummer,
  ).padStart(4, "0")}`;

  await supabaseAdmin.from("facturen").update({ gecrediteerd: true }).eq("id", factuur.id);

  const klantNaam = hv ? `${hv.voornaam} ${hv.achternaam}` : "Klant";
  const pdf = await genereerCreditnotaPdf({
    nummer: creditNummer,
    datum: new Date().toISOString(),
    origineelNummer,
    periode: factuur.periode,
    klantNaam,
    bedragCent: bedrag,
    reden: parsed.data.reden || null,
  });

  const mails: Promise<boolean>[] = [];
  if (hv?.email) {
    mails.push(
      stuurMail({
        naar: hv.email,
        onderwerp: `Creditnota van Grootgenoot (${factuur.periode})`,
        tekst: `Beste ${hv.voornaam},\n\nIn de bijlage vindt u een creditnota (${creditNummer}) voor factuur ${origineelNummer}. We hebben ${euroTekst(bedrag)} teruggeboekt${refundId ? ", dat verschijnt binnen enkele werkdagen op uw rekening" : ""}.\n\nExcuses voor het ongemak. Vragen? Bel of mail ons gerust.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`,
        bijlagen: [{ bestandsnaam: `creditnota-${creditNummer}.pdf`, inhoud: pdf }],
      }),
    );
  }
  mails.push(
    stuurMail({
      naar: eigenaarEmail(),
      onderwerp: `Creditnota aangemaakt: ${creditNummer} (${euroTekst(bedrag)})`,
      tekst: `Creditnota ${creditNummer} op factuur ${origineelNummer} voor ${klantNaam}.\nBedrag: ${euroTekst(bedrag)}\nTerugbetaling: ${refundId ?? "geen (handmatig)"}\nReden: ${parsed.data.reden || "-"}`,
    }),
  );
  await Promise.allSettled(mails);

  return NextResponse.json({ ok: true, nummer: creditNummer });
}

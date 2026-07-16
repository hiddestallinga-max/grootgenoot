import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStripeGeconfigureerd, euroTekst } from "@/lib/stripe";
import { stuurMail, eigenaarEmail } from "@/lib/email";
import {
  reiskostenCent,
  REISKOSTEN_CENT_PER_KM,
  SERVICE_CENT_PER_UUR,
  BTW_PCT_SERVICE,
  btwOverService,
} from "@/lib/tarieven";
import { genereerFactuurPdf, type FactuurSnapshot } from "@/lib/factuurPdf";
import { incassoVanafDatum, datumTekst, INCASSO_WACHT_DAGEN } from "@/lib/incasso";

// Stap 1 van de maandincasso: de factuur versturen en de afschrijving
// aankondigen. De klant krijgt de PDF-factuur met een concrete afschrijfdatum
// (over vijf dagen, SEPA-prenotificatie). De daadwerkelijke afschrijving doet
// de dagelijkse cron (app/api/cron/incasso) zodra die datum is bereikt.
// Annuleren kan tot die tijd met actie "annuleer".

const schema = z.discriminatedUnion("actie", [
  z.object({ actie: z.literal("aankondigen"), koppeling_id: z.string().uuid() }),
  z.object({ actie: z.literal("annuleer"), factuur_id: z.string().uuid() }),
]);

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

/** "juni 2026" bij één maand, anders "mei t/m juni 2026". */
function periodeVanUren(datums: string[]): string {
  const maanden = [...new Set(datums.map((d) => d.slice(0, 7)))].sort();
  const naam = (ym: string) =>
    new Date(`${ym}-15`).toLocaleDateString("nl-NL", {
      month: "long",
      year: "numeric",
    });
  const eerste = maanden[0];
  const laatste = maanden[maanden.length - 1];
  return eerste === laatste ? naam(eerste) : `${naam(eerste)} t/m ${naam(laatste)}`;
}

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

  // ===== Annuleren van een aangekondigde afschrijving =====
  if (parsed.data.actie === "annuleer") {
    const { data: factuur } = await supabaseAdmin
      .from("facturen")
      .select(
        "id, status, periode, totaal_cent, snapshot, koppeling:koppelingen!facturen_koppeling_id_fkey(hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(voornaam, email))",
      )
      .eq("id", parsed.data.factuur_id)
      .single();

    if (!factuur) {
      return NextResponse.json({ error: "Factuur niet gevonden" }, { status: 404 });
    }
    if (factuur.status !== "aangekondigd") {
      return NextResponse.json(
        { error: "Alleen een aangekondigde afschrijving kan worden geannuleerd." },
        { status: 400 },
      );
    }

    await supabaseAdmin
      .from("facturen")
      .update({ status: "geannuleerd" })
      .eq("id", factuur.id);
    await supabaseAdmin
      .from("uren")
      .update({ status: "goedgekeurd", factuur_id: null })
      .eq("factuur_id", factuur.id)
      .eq("status", "gefactureerd");

    const nummer = (factuur.snapshot as { nummer?: string } | null)?.nummer ?? "";
    const hv = (factuur.koppeling as unknown as {
      hulpvrager: { voornaam: string; email: string } | null;
    } | null)?.hulpvrager;
    if (hv?.email) {
      await stuurMail({
        naar: hv.email,
        onderwerp: `De aangekondigde afschrijving gaat niet door (factuur ${nummer})`,
        tekst: `Beste ${hv.voornaam},\n\nDe eerder aangekondigde automatische afschrijving van ${euroTekst(factuur.totaal_cent)} (factuur ${nummer}, ${factuur.periode}) gaat niet door. Er wordt niets van uw rekening afgeschreven.\n\nAls er een gecorrigeerde factuur volgt, ontvangt u die apart per e-mail.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`,
      });
    }
    return NextResponse.json({ ok: true });
  }

  // ===== Factuur opstellen, mailen en de afschrijving aankondigen =====
  const { data: kop } = await supabaseAdmin
    .from("koppelingen")
    .select(
      "id, uurtarief_cent, actief, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(*), grootgenoot:aanmeldingen!koppelingen_grootgenoot_id_fkey(*)",
    )
    .eq("id", parsed.data.koppeling_id)
    .is("verwijderd_op", null)
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
  const periode = periodeVanUren(uren.map((u) => u.datum));
  const vanaf = incassoVanafDatum();

  try {
    const { data: factuur, error: factuurFout } = await supabaseAdmin
      .from("facturen")
      .insert({
        koppeling_id: kop.id,
        periode,
        totaal_cent: totaalCent,
        service_cent: serviceCent,
        status: "aangekondigd",
        incasso_vanaf: vanaf,
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
      serviceCentPerUur: SERVICE_CENT_PER_UUR,
      reiskostenCentPerKm: REISKOSTEN_CENT_PER_KM,
      btwPctService: BTW_PCT_SERVICE,
      btwCent: btwOverService(serviceCent),
      incassoVanaf: vanaf,
      grootgenootKvk: grootgenoot.werkvorm === "zzp" ? grootgenoot.kvk ?? null : null,
      grootgenootBtw: grootgenoot.werkvorm === "zzp" ? grootgenoot.btw_id ?? null : null,
    };
    await supabaseAdmin.from("facturen").update({ snapshot }).eq("id", factuur.id);
    const factuurPdf = await genereerFactuurPdf(snapshot);

    // Uren vastzetten en aan deze factuur koppelen, zodat een mislukte incasso
    // later alleen déze uren terugzet (nooit die van eerdere facturen).
    const urenIds = uren.map((u) => u.id);
    await supabaseAdmin
      .from("uren")
      .update({ status: "gefactureerd", factuur_id: factuur.id })
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
        tekst: `Beste ${hulpvrager.voornaam},\n\nIn de bijlage vindt u uw factuur voor ${periode} (factuurnummer ${nummerWeergave}). Het totaalbedrag is ${euroTekst(totaalCent)}.\n\nDit bedrag wordt op of kort na ${datumTekst(vanaf)} automatisch van uw rekening afgeschreven via uw incassomachtiging. U hoeft niets te doen.\n\nKlopt er iets niet? Bel of mail ons vóór die datum, dan zetten we de afschrijving stil en zoeken we het samen uit.\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl\n06 12154010`,
        bijlagen: [{ bestandsnaam: `factuur-${nummerWeergave}.pdf`, inhoud: factuurPdf }],
      }),
      stuurMail({
        naar: grootgenoot.email,
        onderwerp: `Je uitbetaling van Grootgenoot is aangekondigd (${periode})`,
        tekst: `Beste ${grootgenoot.voornaam},\n\n${overzicht}\n\nDe klant heeft de factuur ontvangen. Rond ${datumTekst(vanaf)} wordt het bedrag afgeschreven; jouw deel (${euroTekst(urenCent + reisCent)}${reisCent > 0 ? `, inclusief ${euroTekst(reisCent)} reiskosten` : ""}) wordt daarna door Stripe rechtstreeks op je rekening gestort.\n\nHartelijke groet,\nHidde van Grootgenoot`,
      }),
      stuurMail({
        naar: eigenaarEmail(),
        onderwerp: `Factuur verstuurd: ${hulpvrager.achternaam} / ${grootgenoot.achternaam} (${euroTekst(totaalCent)})`,
        tekst: `${overzicht}\n\nDe incasso loopt automatisch vanaf ${datumTekst(vanaf)} (${INCASSO_WACHT_DAGEN} dagen wachttijd). Annuleren kan tot die tijd in de regiekamer.`,
      }),
    ]);

    return NextResponse.json({ ok: true, totaal_cent: totaalCent, incasso_vanaf: vanaf });
  } catch (err) {
    console.error("Factuur-fout:", err);
    const boodschap = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json(
      { error: `Factuur versturen mislukt: ${boodschap}` },
      { status: 500 },
    );
  }
}

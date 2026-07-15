import { supabaseAdmin } from "./supabaseAdmin";
import { stuurMail, eigenaarEmail } from "./email";

type Persoon = { voornaam: string; achternaam: string } | null;

/**
 * Stuurt Hidde een melding zodra een grootgenoot nieuwe uren indient.
 * Best-effort: een mislukte mail mag het indienen nooit laten falen.
 */
export async function meldNieuweUren(
  koppelingId: string,
  uren: { datum: string; minuten: number; km: number; omschrijving?: string | null },
): Promise<void> {
  try {
    const { data } = await supabaseAdmin
      .from("koppelingen")
      .select(
        "grootgenoot:aanmeldingen!koppelingen_grootgenoot_id_fkey(voornaam, achternaam), hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(voornaam, achternaam)",
      )
      .eq("id", koppelingId)
      .single();

    const rec = data as unknown as {
      grootgenoot: Persoon;
      hulpvrager: Persoon;
    } | null;

    const gg = rec?.grootgenoot;
    const hv = rec?.hulpvrager;
    const ggNaam = gg ? `${gg.voornaam} ${gg.achternaam}` : "Een grootgenoot";
    const hvNaam = hv ? `${hv.voornaam} ${hv.achternaam}` : "onbekend";
    const uurTekst = (uren.minuten / 60).toLocaleString("nl-NL");

    await stuurMail({
      naar: eigenaarEmail(),
      onderwerp: `Nieuwe uren ingediend: ${ggNaam}`,
      tekst:
        `${ggNaam} heeft nieuwe uren ingediend. Die wachten op je goedkeuring.\n\n` +
        `Voor: ${hvNaam}\n` +
        `Datum: ${new Date(uren.datum).toLocaleDateString("nl-NL")}\n` +
        `Duur: ${uurTekst} uur` +
        (uren.km > 0 ? `\nKilometers: ${uren.km}` : "") +
        (uren.omschrijving ? `\nOmschrijving: ${uren.omschrijving}` : "") +
        `\n\nGoedkeuren doe je in de regiekamer: /admin`,
    });
  } catch (err) {
    console.error("Uren-melding mislukt:", err);
  }
}

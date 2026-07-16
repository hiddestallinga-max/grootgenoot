// Eén bron voor de "Zo gaat het verder"-stappen, gebruikt door zowel de
// aanmeldpagina's (ProcedureUitleg) als de welkomstmail. Zo lopen site en
// mail nooit uit de pas. De mails spreken hulpvragers met "u" aan en
// grootgenoten met "je"; de site gebruikt overal "je".

export type AanspreekVorm = "u" | "je";

export function procedureStappen(
  vorm: AanspreekVorm,
): { titel: string; tekst: string }[] {
  const u = vorm === "u";
  return [
    {
      titel: u ? "We bellen u eerst." : "We bellen je eerst.",
      tekst: u
        ? "We nemen telefonisch contact met u op om uw vraag rustig door te spreken."
        : "We nemen telefonisch contact met je op om je vraag rustig door te spreken.",
    },
    {
      titel: "Gratis kennismakingsgesprek.",
      tekst:
        "Zodra er een passende match is, plannen we een gratis en vrijblijvend kennismakingsgesprek.",
    },
  ];
}

export const MANTELZORGER_TIP =
  "Fijn om te weten: als het relevant is, is het prettig als er een mantelzorger bij het kennismakingsgesprek aanwezig is. Die kan meehelpen bij het regelen van de administratie.";

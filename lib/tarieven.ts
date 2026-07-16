// Reiskostenvergoeding: het wettelijk onbelaste tarief van 23 cent per
// kilometer. Deze vergoeding gaat volledig naar de grootgenoot (het is een
// terugbetaling van reiskosten) en er wordt geen service over gerekend.
// Eén bron van waarheid voor het hele project: site, regiekamer én factuur
// gebruiken deze constanten.
export const REISKOSTEN_CENT_PER_KM = 23;

// Vaste servicebijdrage per gewerkt uur (in centen). Geen percentage.
// Dit bedrag is inclusief btw (zie BTW_PCT_SERVICE).
export const SERVICE_CENT_PER_UUR = 400;

// Btw-percentage dat in de servicebijdrage zit (bemiddeling: 21%).
export const BTW_PCT_SERVICE = 21;

export function reiskostenCent(km: number): number {
  return Math.round(km * REISKOSTEN_CENT_PER_KM);
}

/** Het btw-bedrag dat in een service-totaal (incl. btw) besloten zit. */
export function btwOverService(serviceCentInclBtw: number): number {
  return Math.round(
    (serviceCentInclBtw * BTW_PCT_SERVICE) / (100 + BTW_PCT_SERVICE),
  );
}

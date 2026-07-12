// Reiskostenvergoeding: het wettelijk onbelaste tarief van 23 cent per
// kilometer. Deze vergoeding gaat volledig naar de grootgenoot (het is een
// terugbetaling van reiskosten) en er wordt geen servicepercentage over
// gerekend. Eén bron van waarheid voor het hele project.
export const REISKOSTEN_CENT_PER_KM = 23;

// Vaste servicebijdrage per gewerkt uur (in centen). Geen percentage.
export const SERVICE_CENT_PER_UUR = 400;

export function reiskostenCent(km: number): number {
  return Math.round(km * REISKOSTEN_CENT_PER_KM);
}

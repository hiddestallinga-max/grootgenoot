// Eén bron van waarheid voor de publieke basis-URL. Overschrijfbaar via env
// (bijv. voor previews), standaard het productiedomein.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://grootgenoot.nl"
).replace(/\/$/, "");

export const SITE_NAAM = "Grootgenoot";

// Eén bron van waarheid voor de publieke basis-URL. Overschrijfbaar via env
// (bijv. voor previews), standaard het productiedomein.
// Let op: mét www, want grootgenoot.nl stuurt door naar www.grootgenoot.nl.
// Canonicals, sitemap en JSON-LD moeten naar de úiteindelijke URL wijzen,
// anders krijgt Google tegenstrijdige signalen.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.grootgenoot.nl"
).replace(/\/$/, "");

export const SITE_NAAM = "Grootgenoot";

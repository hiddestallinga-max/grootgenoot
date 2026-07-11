// Sessietokens voor de regiekamer.
//
// In plaats van de geheime string zelf in de cookie te zetten, maken we een
// ondertekend token: "<verlooptijd>.<handtekening>". De handtekening is een
// HMAC-SHA256 over de verlooptijd, met ADMIN_SESSION_SECRET als sleutel.
// Voordelen t.o.v. de oude aanpak:
//  - de cookie bevat het geheim zelf niet meer (lekt de cookie, dan verloopt
//    de toegang vanzelf na de sessieduur);
//  - sessies verlopen ook server-side, niet alleen in de browser.
//
// Gebruikt Web Crypto, zodat het zowel in Node (route handlers) als op de
// Edge-runtime (middleware) werkt.

const encoder = new TextEncoder();

export const SESSIE_DUUR_SECONDEN = 60 * 60 * 24 * 7; // 7 dagen

export async function hmacHex(geheim: string, data: string): Promise<string> {
  const sleutel = await crypto.subtle.importKey(
    "raw",
    encoder.encode(geheim),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const handtekening = await crypto.subtle.sign(
    "HMAC",
    sleutel,
    encoder.encode(data),
  );
  return Array.from(new Uint8Array(handtekening))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function maakSessieToken(geheim: string): Promise<string> {
  const verloopt = Date.now() + SESSIE_DUUR_SECONDEN * 1000;
  const handtekening = await hmacHex(geheim, String(verloopt));
  return `${verloopt}.${handtekening}`;
}

export async function isGeldigSessieToken(
  token: string | undefined,
  geheim: string | undefined,
): Promise<boolean> {
  if (!token || !geheim) return false;

  const [verlooptStr, handtekening] = token.split(".");
  if (!verlooptStr || !handtekening) return false;

  const verloopt = Number(verlooptStr);
  if (!Number.isFinite(verloopt) || Date.now() > verloopt) return false;

  const verwacht = await hmacHex(geheim, verlooptStr);

  // Vergelijking in constante tijd, zodat timing niets verraadt.
  if (handtekening.length !== verwacht.length) return false;
  let verschil = 0;
  for (let i = 0; i < verwacht.length; i++) {
    verschil |= handtekening.charCodeAt(i) ^ verwacht.charCodeAt(i);
  }
  return verschil === 0;
}

import { hmacHex } from "./adminSession";

// Wijziglinks voor "Ik heb me al aangemeld": een ondertekend token dat 24 uur
// toegang geeft tot precies één aanmelding. Formaat: "<id>.<verlooptijd>.<handtekening>".
// Ondertekend met ADMIN_SESSION_SECRET; zonder dat geheim is geen geldig
// token te maken, dus niemand kan andermans aanmelding openen.

const DUUR_MS = 24 * 60 * 60 * 1000; // 24 uur

export async function maakWijzigToken(
  id: string,
  geheim: string,
): Promise<string> {
  const verloopt = Date.now() + DUUR_MS;
  const handtekening = await hmacHex(geheim, `wijzig:${id}:${verloopt}`);
  return `${id}.${verloopt}.${handtekening}`;
}

/** Geeft het aanmelding-id terug als het token geldig en niet verlopen is, anders null. */
export async function leesWijzigToken(
  token: string,
  geheim: string,
): Promise<string | null> {
  const delen = token.split(".");
  if (delen.length !== 3) return null;
  const [id, verlooptStr, handtekening] = delen;

  const verloopt = Number(verlooptStr);
  if (!id || !Number.isFinite(verloopt) || Date.now() > verloopt) return null;

  const verwacht = await hmacHex(geheim, `wijzig:${id}:${verloopt}`);

  if (handtekening.length !== verwacht.length) return null;
  let verschil = 0;
  for (let i = 0; i < verwacht.length; i++) {
    verschil |= handtekening.charCodeAt(i) ^ verwacht.charCodeAt(i);
  }
  return verschil === 0 ? id : null;
}

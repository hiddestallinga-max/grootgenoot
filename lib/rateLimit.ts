// Eenvoudige in-memory rate limiter (sliding window per sleutel, meestal IP).
//
// Let op: op Vercel draait dit per serverless-instantie, dus een vastberaden
// aanvaller kan er deels langs. Voor de MVP is dit prima; wil je het later
// waterdicht, kijk dan naar Vercel WAF of een gedeelde store zoals Upstash.

const registraties = new Map<string, number[]>();

export function isToegestaan(
  sleutel: string,
  maxAantal: number,
  vensterMs: number,
): boolean {
  const nu = Date.now();
  const recent = (registraties.get(sleutel) ?? []).filter(
    (t) => nu - t < vensterMs,
  );

  if (recent.length >= maxAantal) {
    registraties.set(sleutel, recent);
    return false;
  }

  recent.push(nu);
  registraties.set(sleutel, recent);

  // Opruiming zodat de map niet oneindig groeit.
  if (registraties.size > 10_000) {
    for (const [k, tijden] of registraties) {
      if (tijden.every((t) => nu - t >= vensterMs)) registraties.delete(k);
    }
  }

  return true;
}

export function ipVan(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "onbekend"
  );
}

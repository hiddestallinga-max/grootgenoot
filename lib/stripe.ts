import Stripe from "stripe";

// Lazy geïnitialiseerd zodat de build niet faalt zolang de key ontbreekt.
let cached: Stripe | null = null;

export function isStripeGeconfigureerd(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY ontbreekt. Zie .env.example.");
  }
  if (!cached) cached = new Stripe(key);
  return cached;
}

export function euroTekst(cent: number): string {
  return (cent / 100).toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
}

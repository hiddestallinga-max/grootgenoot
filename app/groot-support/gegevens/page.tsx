import Link from "next/link";
import GegevensForm from "@/components/GegevensForm";

export const metadata = {
  title: "Wij regelen je betaling | Grootgenoot",
  description:
    "Liever dat wij je betaling instellen? Vul je gegevens in, dan zetten wij het voor je klaar.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/groot-support/gegevens" },
};

export default function Gegevens() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/groot-support/mijn-aanmelding"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Wij regelen je betaling
      </h1>
      <p className="mt-5 mb-10 text-xl leading-relaxed text-muted">
        Niet zo handig met betaalsites? Geen zorgen. Vul hieronder je gegevens
        in, dan zetten wij de betaling voor je klaar bij Stripe, onze
        betaalpartner. Je hoeft dan zelf niets ingewikkelds te doen.
      </p>

      <GegevensForm />
    </main>
  );
}

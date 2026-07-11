import Link from "next/link";

export const metadata = { title: "Betaalaccount geregeld | Grootgenoot" };

export default function StripeKlaar() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="glas p-8 text-center">
        <h1 className="text-3xl font-bold text-ink">Dank je wel!</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Je gegevens zijn bij Stripe binnen. Zodra alles is gecontroleerd
          (meestal binnen een dag) kunnen je uren rechtstreeks aan jou worden
          uitbetaald. Je hoort van ons.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-support"
        >
          <span aria-hidden="true">←</span> Naar de startpagina
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function GrootSupport() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Groot Support
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Hulp waar het écht telt. Wat past bij jou?
      </p>

      <div className="mt-10 grid gap-6">
        <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">Ik zoek ondersteuning</h2>
          <p className="mt-2 text-lg leading-relaxed text-muted">
            Laat je gegevens achter en we nemen contact op om te kijken hoe we
            kunnen helpen.
          </p>
          <p className="mt-4 text-base font-semibold text-support">
            Aanmeldformulier — in aanbouw
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">
            Ik wil iemand ondersteunen
          </h2>
          <p className="mt-2 text-lg leading-relaxed text-muted">
            Word grootgenoot en help een oudere in de buurt.
          </p>
          <p className="mt-4 text-base font-semibold text-support">
            Aanmeldformulier — in aanbouw
          </p>
        </div>
      </div>
    </main>
  );
}

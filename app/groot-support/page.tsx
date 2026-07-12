import Link from "next/link";
import GlasKaart from "@/components/GlasKaart";

const titel = "Groot Support | Grootgenoot";
const beschrijving =
  "Vind ondersteuning, of word grootgenoot en ondersteun een oudere bij jou in de buurt met hulp en gezelschap.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/groot-support" },
  openGraph: { title: titel, description: beschrijving },
};

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
        <GlasKaart href="/groot-support/hulp-zoeken" className="p-7">
          <h2 className="text-2xl font-bold text-ink">Ik zoek ondersteuning</h2>
          <p className="mt-2 text-lg leading-relaxed text-muted">
            Laat je gegevens achter en we nemen contact op om te kijken hoe we
            je kunnen ondersteunen.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-support">
            Aanmelden{" "}
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </GlasKaart>

        <GlasKaart href="/groot-support/helpen" className="p-7">
          <h2 className="text-2xl font-bold text-ink">
            Ik wil iemand ondersteunen
          </h2>
          <p className="mt-2 text-lg leading-relaxed text-muted">
            Word grootgenoot en ondersteun een oudere in de buurt.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-support">
            Aanmelden{" "}
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </GlasKaart>

        <GlasKaart href="/groot-support/mijn-aanmelding" className="p-7">
          <h2 className="text-2xl font-bold text-ink">Ik heb me al aangemeld</h2>
          <p className="mt-2 text-lg leading-relaxed text-muted">
            Bekijk de status van je aanmelding, wijzig of verwijder je
            gegevens, geef uren door en bekijk je maandoverzichten.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-support">
            Mijn aanmelding{" "}
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </GlasKaart>
      </div>
    </main>
  );
}

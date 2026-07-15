import Link from "next/link";
import LinkAanvraagForm from "@/components/LinkAanvraagForm";
import UrenDirect from "@/components/UrenDirect";

const titel = "Ik heb me al aangemeld | Grootgenoot";
const beschrijving =
  "Geef als grootgenoot je gewerkte uren door, of vraag een beveiligde link aan om je aanmelding te bekijken of te wijzigen. Geen wachtwoord nodig.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/groot-support/mijn-aanmelding" },
  openGraph: { title: titel, description: beschrijving },
};

export default function MijnAanmelding() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/groot-support"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Ik heb me al aangemeld
      </h1>

      <section aria-labelledby="uren" className="mt-10">
        <h2 id="uren" className="text-2xl font-bold text-ink">
          Uren doorgeven
        </h2>
        <p className="mt-3 mb-6 text-lg leading-relaxed text-muted">
          Ben je grootgenoot? Vul je e-mailadres in, dan kun je hier meteen je
          gewerkte uren doorgeven. Geen link uit je mail nodig. Na controle komen
          ze op het maandoverzicht en worden ze automatisch uitbetaald.
        </p>
        <UrenDirect />
      </section>

      <hr className="my-12 border-ink/10" />

      <section aria-labelledby="wijzigen">
        <h2 id="wijzigen" className="text-2xl font-bold text-ink">
          Aanmelding bekijken of wijzigen
        </h2>
        <p className="mt-3 mb-6 text-lg leading-relaxed text-muted">
          Vul je e-mailadres in, dan sturen we je een beveiligde link. Daarmee
          kun je de status van je aanmelding zien, je gegevens wijzigen of je
          afmelden. Geen wachtwoord nodig.
        </p>
        <LinkAanvraagForm />
      </section>

      <hr className="my-12 border-ink/10" />

      <section aria-labelledby="betaling">
        <h2 id="betaling" className="text-2xl font-bold text-ink">
          Liever dat wij je betaling regelen?
        </h2>
        <p className="mt-3 mb-5 text-lg leading-relaxed text-muted">
          Niet zo handig met betaalsites? Dan zetten wij de betaling voor je
          klaar. Vul je gegevens in, dan regelen wij de rest.
        </p>
        <Link
          href="/groot-support/gegevens"
          className="inline-flex items-center gap-2 rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90"
        >
          Mijn gegevens doorgeven <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}

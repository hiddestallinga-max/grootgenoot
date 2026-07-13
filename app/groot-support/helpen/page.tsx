import Link from "next/link";
import AanmeldForm from "@/components/AanmeldForm";

const titel = "Ik wil iemand ondersteunen | Grootgenoot";
const beschrijving =
  "Word grootgenoot: ondersteun een oudere bij jou in de buurt met hulp en gezelschap, met een eerlijk uurtarief. Ook zonder eigen bedrijf, ideaal naast je studie.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/groot-support/helpen" },
  openGraph: { title: titel, description: beschrijving },
};

export default function Helpen() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/groot-support"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>
      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Ik wil iemand ondersteunen
      </h1>
      <p className="mt-5 mb-8 text-xl leading-relaxed text-muted">
        Word grootgenoot en ondersteun een oudere in je buurt. Laat je gegevens
        achter, dan bespreken we samen wat bij je past.
      </p>

      <div className="mb-10 rounded-2xl border border-support/20 bg-support/5 p-6">
        <h2 className="text-xl font-bold text-ink">Geen eigen bedrijf nodig</h2>
        <p className="mt-2 text-lg leading-relaxed text-muted">
          Je hoeft geen KvK-inschrijving te hebben om grootgenoot te worden.
          Doe je het incidenteel of naast je studie, dan kan het vaak zonder
          KvK: de oudere is dan formeel je opdrachtgever (via de regeling
          dienstverlening aan huis, tot drie dagen per week) en je geeft je
          inkomsten zelf op. Doe je het structureel, dan werk je als
          zelfstandige met een eigen KvK-inschrijving. We denken graag met je
          mee over wat bij jouw situatie past.
        </p>
      </div>

      <AanmeldForm rol="grootgenoot" />
    </main>
  );
}

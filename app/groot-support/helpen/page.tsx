import Link from "next/link";
import AanmeldForm from "@/components/AanmeldForm";

const titel = "Ik wil iemand ondersteunen | Grootgenoot";
const beschrijving =
  "Word grootgenoot: ondersteun een oudere bij jou in de buurt met hulp en gezelschap, als zelfstandige met een eerlijk uurtarief.";

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
      <p className="mt-5 mb-10 text-xl leading-relaxed text-muted">
        Word grootgenoot en ondersteun een oudere in je buurt. Laat je gegevens
        achter, dan bespreken we samen wat bij je past.
      </p>
      <AanmeldForm rol="grootgenoot" />
    </main>
  );
}

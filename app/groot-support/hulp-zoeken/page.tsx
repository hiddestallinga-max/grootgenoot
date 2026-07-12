import Link from "next/link";
import AanmeldForm from "@/components/AanmeldForm";

const titel = "Ik zoek ondersteuning | Grootgenoot";
const beschrijving =
  "Zoek je ondersteuning of gezelschap? Meld je aan en we koppelen je aan een betrouwbare grootgenoot uit de buurt.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/groot-support/hulp-zoeken" },
  openGraph: { title: titel, description: beschrijving },
};

export default function HulpZoeken() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/groot-support"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>
      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Ik zoek ondersteuning
      </h1>
      <p className="mt-5 mb-10 text-xl leading-relaxed text-muted">
        Laat je gegevens achter. We nemen persoonlijk contact met je op om te
        kijken hoe we je kunnen ondersteunen, hoe klein de vraag ook is.
      </p>
      <AanmeldForm rol="hulpvrager" />
    </main>
  );
}

import Link from "next/link";
import TariefCalculator from "@/components/TariefCalculator";
import JsonLd from "@/components/JsonLd";

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wat kost hulp van een grootgenoot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Je grootgenoot ontvangt het volledige uurtarief, meestal tussen de € 25 en € 35, in overleg met jou bepaald. Daarbovenop komt een vaste servicebijdrage van € 4,00 per uur.",
      },
    },
    {
      "@type": "Question",
      name: "Zijn er inschrijf- of matchkosten?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee. Je betaalt geen inschrijfkosten, geen matchkosten, geen minimum aantal uren en er is geen opzegtermijn. De eerste kennismaking is gratis en vrijblijvend.",
      },
    },
    {
      "@type": "Question",
      name: "Worden er reiskosten gerekend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alleen als je grootgenoot voor je reist: € 0,23 per kilometer, het wettelijke onbelaste tarief. Deze vergoeding gaat volledig naar je grootgenoot en staat apart op je maandoverzicht.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe betaal ik?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Je betaalt één keer per maand in één bedrag via automatische incasso. Vooraf krijg je per e-mail een overzicht van de gewerkte uren. Het uurdeel gaat rechtstreeks naar je grootgenoot, het servicedeel naar het platform.",
      },
    },
    {
      "@type": "Question",
      name: "Is de grootgenoot gescreend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Elke grootgenoot is zorgvuldig geselecteerd, met een recente verklaring omtrent gedrag (VOG) en referenties.",
      },
    },
  ],
};

const titel = "Tarieven | Grootgenoot";
const beschrijving =
  "Transparante tarieven: het uurtarief gaat volledig naar je grootgenoot, plus een vaste service van € 4,00 per uur. Geen inschrijf- of matchkosten. Reken het zelf uit.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/tarieven" },
  openGraph: { title: titel, description: beschrijving },
};

export default function Tarieven() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <JsonLd data={faq} />
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Tarieven
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Geen kleine lettertjes. Dit betaal je, en dit is waar je geld
        heengaat. Reken het hieronder zelf uit.
      </p>

      <div className="mt-8">
        <TariefCalculator />
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">Waar je geld heengaat</h2>
      <div className="mt-4 space-y-4 text-xl leading-relaxed text-muted">
        <p>
          Je grootgenoot ontvangt het volledige uurtarief, meestal tussen de
          25 en 35 euro. Dat tarief spreek je samen af.
        </p>
        <p>
          Daarbovenop rekenen wij een vaste servicebijdrage van € 4,00 per
          uur.
        </p>
        <p>
          Waar die service voor is: de persoonlijke kennismaking en een
          zorgvuldige match, waarbij we van elke grootgenoot een verklaring
          omtrent gedrag (VOG) en referenties vragen. Verder: vervanging bij
          ziekte of vakantie, een nieuwe match als het toch niet klikt, de
          urenregistratie en het duidelijke maandoverzicht, de veilige
          automatische betaling, en één vast aanspreekpunt, ook voor je
          familie. Alle bedragen zijn inclusief btw.
        </p>
        <p>
          Reist je grootgenoot voor jou, bijvoorbeeld om je ergens naartoe te
          brengen, dan komt daar een reiskostenvergoeding bij van € 0,23 per
          kilometer. Dat is het wettelijke onbelaste tarief. Deze vergoeding
          gaat volledig naar je grootgenoot, er zit geen service op, en de
          gereden kilometers staan apart op je maandoverzicht. Blijft de
          hulp bij jou thuis, dan betaal je hier niets voor.
        </p>
        <p>
          Verder betaal je niets: geen inschrijfkosten, geen matchkosten, geen
          minimum aantal uren en geen opzegtermijn. De eerste kennismaking is
          altijd gratis en vrijblijvend.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">Zo werkt betalen</h2>
      <div className="mt-4 space-y-4 text-xl leading-relaxed text-muted">
        <p>
          Je betaalt één keer per maand, in één bedrag. Vooraf krijg je per
          e-mail een overzicht van de gewerkte uren, zodat je nooit voor
          verrassingen staat. Het betaalsysteem splitst het bedrag daarna
          automatisch: het uurdeel gaat rechtstreeks naar je grootgenoot, het
          servicedeel naar het platform. Het geld van je grootgenoot komt dus
          nooit op onze rekening.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">
        Eerlijk over de afspraken
      </h2>
      <div className="mt-4 space-y-4 text-xl leading-relaxed text-muted">
        <p>
          Je grootgenoot werkt rechtstreeks voor jou; wij bemiddelen,
          ondersteunen en blijven bereikbaar. Elke grootgenoot is zorgvuldig
          gekozen en heeft een recente verklaring omtrent gedrag (VOG) en
          referenties.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/groot-support/hulp-zoeken"
          className="rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90"
        >
          Ik zoek ondersteuning
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-support bg-white px-6 py-4 text-xl font-bold text-support transition hover:bg-support/5"
        >
          Stel een vraag
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import TariefCalculator from "@/components/TariefCalculator";

export const metadata = { title: "Tarieven | Grootgenoot" };

export default function Tarieven() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
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
          Je grootgenoot is zelfstandig ondernemer en ontvangt zijn of haar
          volledige uurtarief, meestal tussen de 28 en 35 euro. Dat tarief
          bepaalt de grootgenoot zelf, in overleg met jou.
        </p>
        <p>
          Daarbovenop rekenen wij 10 tot 20% service, afhankelijk van de
          hulpvraag. Bij een lichte hulpvraag, zoals gezelschap of samen
          boodschappen doen, zit je aan de onderkant. Vraagt de situatie om
          meer coördinatie, bijvoorbeeld bij vergeetachtigheid, meerdere
          hulpmomenten per week of afstemming met familie en huisarts, dan
          ligt het percentage hoger. We spreken het vooraf met je af en het
          blijft gelijk zolang de koppeling loopt.
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
          servicedeel naar Grootgenoot. Het geld van je grootgenoot komt dus
          nooit op onze rekening.
        </p>
        <p className="text-lg">
          De automatische betaalomgeving wordt op dit moment ingericht. Tot
          die klaar is, ontvang je hetzelfde maandoverzicht en betaal je de
          grootgenoot en Grootgenoot nog los van elkaar.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">
        Eerlijk over de afspraken
      </h2>
      <div className="mt-4 space-y-4 text-xl leading-relaxed text-muted">
        <p>
          Je grootgenoot werkt als zelfstandige rechtstreeks voor jou; wij
          bemiddelen, ondersteunen en blijven bereikbaar. Elke grootgenoot
          heeft een eigen KvK-inschrijving, een aansprakelijkheidsverzekering
          en een recente verklaring omtrent gedrag (VOG).
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/groot-support/hulp-zoeken"
          className="rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90"
        >
          Ik zoek hulp
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

import Link from "next/link";
import TerugKnop from "@/components/TerugKnop";

const titel = "Voor familie en mantelzorgers | Grootgenoot";
const beschrijving =
  "Zoek je hulp of gezelschap voor je vader, moeder of een naaste in de regio Arnhem–Nijmegen? Zo regel je als familie of mantelzorger een grootgenoot.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/voor-familie" },
  openGraph: { title: titel, description: beschrijving },
};

export default function VoorFamilie() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <TerugKnop naar="/" />

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Voor familie en mantelzorgers
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Maak je je zorgen om je vader, moeder of een andere naaste? Woon je te
        ver weg om vaak langs te gaan, of komt er naast je werk en gezin te
        weinig tijd over? Dan kan een grootgenoot uitkomst bieden: een vast,
        vertrouwd iemand uit de buurt die langsgaat voor gezelschap en de
        gewone dingen van alledag.
      </p>

      <h2 className="mt-12 text-2xl font-bold text-ink">
        Wat een grootgenoot voor je naaste doet
      </h2>
      <div className="mt-4 space-y-4 text-xl leading-relaxed text-muted">
        <p>
          Denk aan samen koffie drinken, wandelen, boodschappen doen, koken,
          meegaan naar een afspraak of helpen herinneren aan medicijnen. Geen
          medische zorg, wel de aandacht en het gezelschap waarvoor de
          thuiszorg vaak geen tijd heeft. Het is steeds dezelfde persoon, dus
          er ontstaat een echte band.
        </p>
        <p>
          Voor jou als familie betekent het: minder gaten om zelf op te
          vullen, een extra paar ogen dat af en toe langsgaat, en één vast
          aanspreekpunt dat je kunt bellen als er iets is.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">
        Zo regel je het voor een ander
      </h2>
      <div className="mt-4 space-y-4 text-xl leading-relaxed text-muted">
        <p>
          Je kunt de aanmelding gewoon zelf doen: kies bij het formulier
          &quot;Voor een naaste&quot; en vul je eigen contactgegevens in. Wij
          bellen jou eerst om de vraag rustig door te spreken. Daarna volgt
          een gratis en vrijblijvend kennismakingsgesprek bij je naaste thuis,
          en het is juist fijn als jij daarbij bent.
        </p>
        <p>
          Ook de administratie kun je uit handen nemen: het maandoverzicht en
          de factuur kunnen naar jouw e-mailadres, en je kunt helpen bij het
          instellen van de automatische betaling. Zo hoeft je naaste zich
          nergens zorgen over te maken.
        </p>
        <p>
          De kosten zijn overzichtelijk: het uurtarief van de grootgenoot
          (meestal 25 tot 35 euro, in overleg) plus een vaste service van 4
          euro per uur. Geen inschrijfkosten, geen minimum aantal uren, geen
          opzegtermijn. Bekijk de{" "}
          <Link href="/tarieven" className="font-semibold text-support underline">
            tarieven
          </Link>{" "}
          en reken het zelf uit.
        </p>
      </div>

      <div className="glas my-10 p-7">
        <p className="text-2xl font-bold leading-snug text-ink">
          Twijfel je of het iets is voor je naaste? Bel ons gerust, dan denken
          we vrijblijvend mee.
        </p>
        <p className="mt-3 text-lg text-muted">
          <a href="tel:+31612154010" className="font-semibold text-support underline">
            06 12154010
          </a>{" "}
          of{" "}
          <a
            href="mailto:info@grootgenoot.nl"
            className="font-semibold text-support underline"
          >
            info@grootgenoot.nl
          </a>
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/groot-support/hulp-zoeken"
          className="rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90"
        >
          Aanmelden voor een naaste
        </Link>
        <Link
          href="/werkgebied"
          className="rounded-xl border border-support bg-white px-6 py-4 text-xl font-bold text-support transition hover:bg-support/5"
        >
          Bekijk het werkgebied
        </Link>
      </div>
    </main>
  );
}

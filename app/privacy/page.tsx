import TerugKnop from "@/components/TerugKnop";

const titel = "Privacyverklaring | Grootgenoot";
const beschrijving =
  "Hoe Grootgenoot omgaat met je persoonsgegevens: welke gegevens we verwerken, waarvoor, hoe lang we ze bewaren en welke rechten je hebt.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/privacy" },
  openGraph: { title: titel, description: beschrijving },
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <TerugKnop naar="/" />

      <h1 className="text-4xl font-bold leading-tight text-ink">
        Privacyverklaring
      </h1>
      <p className="mt-4 text-lg text-muted">Laatst bijgewerkt: juli 2026</p>

      <div className="mt-8 space-y-8 text-lg leading-relaxed text-muted">
        <section>
          <h2 className="text-2xl font-bold text-ink">Wie wij zijn</h2>
          <p className="mt-3">
            Grootgenoot (gevestigd in De Steeg, KvK 42103745) is
            verantwoordelijk voor de verwerking van persoonsgegevens zoals
            beschreven in deze verklaring. Vragen over je gegevens? Mail naar{" "}
            <a href="mailto:info@grootgenoot.nl" className="font-semibold text-support underline">
              info@grootgenoot.nl
            </a>{" "}
            of bel 06 12154010.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">
            Welke gegevens we verwerken
          </h2>
          <p className="mt-3">
            Bij een aanmelding: je naam, e-mailadres, telefoonnummer, postcode
            en wat je zoekt of biedt (categorieën, urgentie, beschikbaarheid en
            je toelichting). Bij het contactformulier: je naam, e-mailadres en
            je bericht. Loopt er een koppeling, dan verwerken we ook de
            gewerkte uren en de maandoverzichten.
          </p>
          <p className="mt-3">
            Betalingen verlopen via onze betaalpartner Stripe. Je bankgegevens
            en incassomachtiging worden door Stripe verwerkt en bewaard; wij
            zien of bewaren zelf geen rekeningnummers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Waarvoor we ze gebruiken</h2>
          <p className="mt-3">
            Om contact met je op te nemen na een aanmelding of bericht, om een
            passende koppeling te maken en te onderhouden, voor de maandelijkse
            afrekening, en om te voldoen aan wettelijke verplichtingen zoals de
            administratieplicht. We verkopen nooit gegevens en delen niets met
            derden voor reclame.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Met wie we samenwerken</h2>
          <p className="mt-3">
            We gebruiken een klein aantal diensten die gegevens voor ons
            verwerken: Supabase (beveiligde database, opslag binnen de EU),
            Resend (het versturen van e-mail), Stripe (betalingen) en Vercel
            (het draaien van deze website). Deze partijen gebruiken je
            gegevens uitsluitend voor Grootgenoot en niet voor eigen doelen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Hoe lang we bewaren</h2>
          <p className="mt-3">
            Aanmeldgegevens bewaren we tot je je afmeldt (dat kan altijd zelf,
            via &quot;Ik heb me al aangemeld&quot; op de site) en uiterlijk twee jaar na
            het laatste contact. Berichten via het contactformulier bewaren we
            maximaal een jaar. Facturen en betaalgegevens bewaren we zeven
            jaar; dat is de wettelijke fiscale bewaarplicht.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Je rechten</h2>
          <p className="mt-3">
            Je mag je gegevens altijd inzien, laten aanpassen of laten
            verwijderen. Wijzigen en verwijderen kan direct zelf via de
            beveiligde link op de site, of stuur ons een mailtje en we regelen
            het binnen enkele dagen.
          </p>
        </section>
      </div>
    </main>
  );
}

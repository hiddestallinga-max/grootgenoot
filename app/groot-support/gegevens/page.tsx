import TerugKnop from "@/components/TerugKnop";
import GegevensForm from "@/components/GegevensForm";

export const metadata = {
  title: "Wij regelen je betaling | Grootgenoot",
  description:
    "Liever dat wij je betaling instellen? Vul je gegevens in, dan zetten wij het voor je klaar.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/groot-support/gegevens" },
};

export default function Gegevens() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <TerugKnop naar="/groot-support/mijn-aanmelding" />

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Wij regelen je betaling
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Niet zo handig met betaalsites? Geen zorgen. Vul hieronder je gegevens
        in, dan zetten wij alles voor je klaar bij Stripe, onze betaalpartner.
      </p>
      <p className="mt-4 mb-10 text-xl leading-relaxed text-muted">
        Je krijgt daarna nog één e-mail met één knop om het te bevestigen; dat
        laatste stukje moet je wettelijk zelf doen. Komt er iemand bij je thuis
        of belt er familie mee? Dan kan die er ook even bij helpen. Kom je er
        niet uit, bel ons gerust op{" "}
        <a href="tel:+31612154010" className="font-semibold text-support underline">
          06 12154010
        </a>
        .
      </p>

      <GegevensForm />
    </main>
  );
}

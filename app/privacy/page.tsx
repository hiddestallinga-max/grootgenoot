import Link from "next/link";

export const metadata = { title: "Privacyverklaring — GrootGenoot" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>
      <h1 className="text-4xl font-bold leading-tight text-ink">
        Privacyverklaring
      </h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        <p>
          GrootGenoot verwerkt de gegevens die je bij een aanmelding achterlaat
          (naam, e-mailadres, telefoonnummer, postcode en wat je zoekt of biedt)
          met één doel: contact met je opnemen om een passende koppeling te
          maken.
        </p>
        <p>
          We vragen alleen wat nodig is, bewaren je gegevens niet langer dan
          nodig, en delen ze niet met derden zonder jouw toestemming. Je gegevens
          worden opgeslagen binnen de Europese Unie.
        </p>
        <p>
          Wil je je gegevens inzien of laten verwijderen? Neem contact met ons
          op, dan regelen we dat.
        </p>
        <p className="text-base italic">
          Dit is een eerste versie. Voor de definitieve lancering vullen we deze
          verklaring aan met contactgegevens en bewaartermijnen.
        </p>
      </div>
    </main>
  );
}

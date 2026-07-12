import Link from "next/link";

export const metadata = { title: "Over Grootgenoot | Onze visie" };

export default function Over() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Over Grootgenoot
      </h1>

      <div className="mt-8 space-y-6 text-xl leading-relaxed text-muted">
        <p>
          Nederland vergrijst in hoog tempo. De babyboomgeneratie bereikt de
          leeftijd waarop hulp nodig wordt, terwijl het aantal mensen dat die
          hulp kan geven juist krimpt. De druk op de zorg wordt de komende
          jaren enorm: langere wachtlijsten, vollere agenda&apos;s en
          zorgprofessionals die verdrinken in taken waarvoor ze nooit zijn
          opgeleid.
        </p>
        <p>
          Want veel van wat ouderen nodig hebben is geen medische zorg.
          Gezelschap. Een wandeling. Boodschappen. Steunkousen aantrekken.
          Hulp bij het onthouden van medicatie of afspraken. Daarvoor is geen
          diploma nodig, wel een betrouwbaar iemand uit de buurt.
        </p>
      </div>

      <div className="glas my-10 p-7">
        <p className="text-2xl font-bold leading-snug text-ink">
          Professionele zorg voor wie het echt nodig heeft. Een grootgenoot
          voor al het andere.
        </p>
      </div>

      <div className="space-y-6 text-xl leading-relaxed text-muted">
        <p>
          Daarom is er Grootgenoot. Wij koppelen ouderen aan grootgenoten:
          mensen uit de buurt die ondersteunen en gezelschap houden. Bewust privaat
          en uit eigen portemonnee, zonder indicatie, zonder wachtlijst en
          zonder minimum aantal uren. Je betaalt alleen voor de hulp die je
          echt wilt.
        </p>
        <p>
          Zo snijdt het mes aan twee kanten. Ouderen krijgen sneller en
          persoonlijker hulp, en zorgprofessionals houden hun handen vrij voor
          het werk waarvoor ze zijn opgeleid.
        </p>
        <p>
          Onze blik is op de lange termijn. Wie vroeg begint met kleine hulp,
          gezelschap en beweging, blijft langer gezond en zelfstandig thuis.
          Dat is fijner voor iedereen, en het scheelt de samenleving veel
          zorgkosten. We werken daarom graag samen met huisartsen, buurtzorg
          en verzorgingshuizen.
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
          href="/groot-support/helpen"
          className="rounded-xl border border-support bg-white px-6 py-4 text-xl font-bold text-support transition hover:bg-support/5"
        >
          Ik wil ondersteunen
        </Link>
      </div>
    </main>
  );
}

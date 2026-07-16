import Image from "next/image";
import Link from "next/link";
import TerugKnop from "@/components/TerugKnop";

const titel = "Over Grootgenoot | Onze visie";
const beschrijving =
  "Waarom Grootgenoot bestaat: door de vergrijzing is er meer behoefte aan hulp en gezelschap dan de zorg aankan. Wij koppelen ouderen aan mensen uit de buurt.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/over" },
  openGraph: { title: titel, description: beschrijving },
};

export default function Over() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <TerugKnop naar="/" />

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Over Grootgenoot
      </h1>

      <div className="mt-8 text-xl leading-relaxed text-muted [&>p+p]:mt-4">
        <Image
          src="/hidde.webp"
          alt="Hidde, oprichter van Grootgenoot"
          width={530}
          height={688}
          className="float-right ml-6 mb-3 w-44 max-w-[45%] sm:w-72"
          style={{ shapeOutside: "url(/hidde.webp)", shapeMargin: "16px" }}
        />
        <p>
          Ik ben Hidde, oprichter van Grootgenoot. Ik groeide op in een gezin
          waarin zorg vanzelfsprekend was, met twee moeders die er middenin
          staan: een kinderarts en een wijkverpleegkundige. In juli 2026 ben ik
          Grootgenoot begonnen, naast mijn studie social design aan de HKU.
        </p>
        <p>
          Van huis uit weet ik hoe waardevol aandacht en goede hulp zijn, en hoe
          zwaar de druk op de zorg is geworden. Grootgenoot is mijn manier om
          daar iets aan te doen.
        </p>
        <div className="clear-both" />
      </div>

      <h2 className="mt-12 text-2xl font-bold text-ink">Waarom Grootgenoot</h2>
      <div className="mt-4 space-y-5 text-xl leading-relaxed text-muted">
        <p>
          Nederland vergrijst in hoog tempo. De babyboomgeneratie bereikt de
          leeftijd waarop hulp nodig wordt, terwijl het aantal mensen dat die
          hulp kan geven juist krimpt. De wachtlijsten groeien en
          zorgprofessionals verdrinken in taken waarvoor ze nooit zijn opgeleid.
        </p>
        <p>
          Want veel van wat ouderen nodig hebben is geen medische zorg.
          Gezelschap, een wandeling, de boodschappen, hulp bij het onthouden van
          afspraken. Daarvoor is geen diploma nodig, wel een betrouwbaar iemand
          uit de buurt.
        </p>
      </div>

      <div className="glas my-10 p-7">
        <p className="text-2xl font-bold leading-snug text-ink">
          Professionele zorg voor wie het echt nodig heeft. Een grootgenoot
          voor al het andere.
        </p>
      </div>

      <div className="space-y-5 text-xl leading-relaxed text-muted">
        <p>
          Grootgenoot koppelt ouderen aan die betrouwbare buur. Bewust privaat
          en uit eigen portemonnee, zonder indicatie, zonder wachtlijst en
          zonder minimum aantal uren. Je betaalt alleen voor de hulp die je echt
          wilt.
        </p>
        <p>
          Zo krijgen ouderen sneller en persoonlijker hulp, en houden
          zorgprofessionals hun handen vrij voor het werk waarvoor ze zijn
          opgeleid. Wie vroeg begint met kleine hulp, gezelschap en beweging,
          blijft bovendien langer gezond en zelfstandig thuis. Daarom werken we
          graag samen met huisartsen, buurtzorg en verzorgingshuizen.
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
          href="/groot-support/helpen"
          className="rounded-xl border border-support bg-white px-6 py-4 text-xl font-bold text-support transition hover:bg-support/5"
        >
          Ik wil ondersteunen
        </Link>
      </div>
    </main>
  );
}

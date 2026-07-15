import TerugKnop from "@/components/TerugKnop";
import AanmeldForm from "@/components/AanmeldForm";
import ProcedureUitleg from "@/components/ProcedureUitleg";

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
      <TerugKnop naar="/groot-support" />
      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Ik zoek ondersteuning
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Iemand uit de buurt voor gezelschap en praktische hulp, thuis en op pad.
        Laat je gegevens achter, dan nemen we persoonlijk contact met je op, hoe
        klein de vraag ook is. Gratis en vrijblijvend.
      </p>
      <ProcedureUitleg metMantelzorger />
      <AanmeldForm rol="hulpvrager" />
    </main>
  );
}

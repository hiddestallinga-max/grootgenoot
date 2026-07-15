import TerugKnop from "@/components/TerugKnop";
import ContactForm from "@/components/ContactForm";

const titel = "Contact | Grootgenoot";
const beschrijving =
  "Vragen of even overleggen? Bel of mail Grootgenoot, of stuur een bericht via het contactformulier.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/contact" },
  openGraph: { title: titel, description: beschrijving },
};

export default function Contact() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <TerugKnop naar="/" />

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Contact
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Vragen, ideeën of gewoon even overleggen? Stuur een bericht, dan
        reageren we zo snel mogelijk.
      </p>

      <div className="glas mt-8 p-6">
        <p className="text-lg">
          <span className="font-semibold text-ink">E-mail:</span>{" "}
          <a
            href="mailto:info@grootgenoot.nl"
            className="font-semibold text-support underline"
          >
            info@grootgenoot.nl
          </a>
        </p>
        <p className="mt-2 text-lg">
          <span className="font-semibold text-ink">Telefoon:</span>{" "}
          <a
            href="tel:+31612154010"
            className="font-semibold text-support underline"
          >
            06 12154010
          </a>
        </p>
        <p className="mt-3 text-base text-muted">
          KvK 42103745 · BTW NL005497451B95 · IBAN: NL59 ASNB 0708 8601 92
        </p>
      </div>

      <div className="mt-10">
        <ContactForm />
      </div>
    </main>
  );
}

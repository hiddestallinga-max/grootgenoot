import Link from "next/link";
import LinkAanvraagForm from "@/components/LinkAanvraagForm";

export const metadata = { title: "Mijn aanmelding | Grootgenoot" };

export default function MijnAanmelding() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/groot-support"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Mijn registratie
      </h1>
      <p className="mt-5 mb-10 text-xl leading-relaxed text-muted">
        Vul je e-mailadres in, dan sturen we je een beveiligde link. Daarmee kun
        je de status van je aanmelding zien, je gegevens wijzigen of je
        afmelden. Geen wachtwoord nodig.
      </p>

      <LinkAanvraagForm />
    </main>
  );
}

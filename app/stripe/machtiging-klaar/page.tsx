import Link from "next/link";

export const metadata = { title: "Machtiging geregeld | Grootgenoot" };

export default function MachtigingKlaar() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="glas p-8 text-center">
        <h1 className="text-3xl font-bold text-ink">Machtiging geregeld</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Dank u wel. De maandelijkse betaling gaat voortaan automatisch. U
          ontvangt elke maand vooraf een overzicht van de uren, en u kunt de
          machtiging altijd stopzetten via ons.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-support"
        >
          <span aria-hidden="true">←</span> Naar de startpagina
        </Link>
      </div>
    </main>
  );
}

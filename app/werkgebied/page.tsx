import Link from "next/link";
import { PLAATSEN } from "@/lib/plaatsen";

const titel = "Werkgebied | Grootgenoot";
const beschrijving =
  "Grootgenoot is actief in de regio Arnhem–Nijmegen en omstreken. Bekijk in welke plaatsen we hulp en gezelschap voor ouderen bieden.";

export const metadata = {
  title: titel,
  description: beschrijving,
  alternates: { canonical: "/werkgebied" },
  openGraph: { title: titel, description: beschrijving },
};

export default function Werkgebied() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Terug
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Ons werkgebied
      </h1>
      <p className="mt-5 text-xl leading-relaxed text-muted">
        Grootgenoot koppelt ouderen aan iemand uit de buurt in de hele regio
        Arnhem–Nijmegen en omstreken. Kies je plaats voor meer informatie, of
        meld je gewoon aan, dan kijken we samen wat past.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PLAATSEN.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/hulp-in/${p.slug}`}
              className="block rounded-xl border border-support/25 bg-white px-4 py-3 text-lg font-semibold text-support transition hover:bg-support/5"
            >
              {p.naam}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-lg text-muted">
        Staat jouw plaats er niet bij, maar woon je in de buurt? Neem gerust{" "}
        <Link href="/contact" className="font-semibold text-support underline">
          contact
        </Link>{" "}
        op, dan kijken we wat mogelijk is.
      </p>

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

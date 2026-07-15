import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GlasKaart from "@/components/GlasKaart";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { PLAATSEN, plaatsBySlug } from "@/lib/plaatsen";
import { CATEGORIEEN } from "@/lib/types";

export function generateStaticParams() {
  return PLAATSEN.map((p) => ({ plaats: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ plaats: string }>;
}): Promise<Metadata> {
  const { plaats } = await params;
  const p = plaatsBySlug(plaats);
  if (!p) return {};

  const titel = `Hulp en gezelschap in ${p.naam} | Grootgenoot`;
  const beschrijving = `Hulp en gezelschap voor ouderen in ${p.naam} en omgeving, door iemand uit de buurt. Betrouwbaar, met VOG en één vast aanspreekpunt.`;
  return {
    title: titel,
    description: beschrijving,
    alternates: { canonical: `/hulp-in/${p.slug}` },
    openGraph: { title: titel, description: beschrijving },
  };
}

export default async function HulpInPlaats({
  params,
}: {
  params: Promise<{ plaats: string }>;
}) {
  const { plaats } = await params;
  const p = plaatsBySlug(plaats);
  if (!p) notFound();

  const nabij = p.nabij
    .map((s) => plaatsBySlug(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Hulp en gezelschap voor ouderen in ${p.naam}`,
    serviceType: "Ondersteuning en gezelschap voor ouderen",
    url: `${SITE_URL}/hulp-in/${p.slug}`,
    areaServed: { "@type": "City", name: p.naam },
    provider: {
      "@type": "LocalBusiness",
      name: "Grootgenoot",
      url: SITE_URL,
      telephone: "+31612154010",
      email: "info@grootgenoot.nl",
    },
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <JsonLd data={service} />

      <Link
        href="/werkgebied"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support"
      >
        <span aria-hidden="true">←</span> Werkgebied
      </Link>

      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Hulp en gezelschap in {p.naam}
      </h1>
      <p className="mt-2 text-lg text-muted">Gemeente {p.gemeente}</p>

      <p className="mt-6 text-xl leading-relaxed text-muted">{p.intro}</p>

      <h2 className="mt-10 text-2xl font-bold text-ink">
        Wat een grootgenoot voor je doet
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {CATEGORIEEN.map((c) => (
          <li
            key={c}
            className="rounded-full bg-support/10 px-4 py-2 text-base font-semibold text-support"
          >
            {c}
          </li>
        ))}
      </ul>

      {p.buurten.length > 0 && (
        <p className="mt-8 text-xl leading-relaxed text-muted">
          Actief in heel {p.naam}, onder meer in {p.buurten.slice(0, -1).join(", ")}{" "}
          en {p.buurten[p.buurten.length - 1]}.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <GlasKaart
          href="/groot-support/hulp-zoeken"
          volgKracht={14}
          kantelKracht={7}
          className="bg-support/90 border-support/40 px-8 py-4"
        >
          <span className="text-xl font-bold text-white">Ik zoek ondersteuning</span>
        </GlasKaart>
        <GlasKaart
          href="/groot-support/helpen"
          volgKracht={14}
          kantelKracht={7}
          className="px-8 py-4"
        >
          <span className="text-xl font-bold text-support">
            Ik wil ondersteunen
          </span>
        </GlasKaart>
      </div>

      {nabij.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-ink">Ook actief in de buurt</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {nabij.map((n) => (
              <Link
                key={n.slug}
                href={`/hulp-in/${n.slug}`}
                className="rounded-xl border border-support/30 bg-white px-4 py-2 text-lg font-semibold text-support transition hover:bg-support/5"
              >
                {n.naam}
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-lg text-muted">
        Grootgenoot is er voor de hele regio Arnhem–Nijmegen en omstreken.{" "}
        <Link href="/werkgebied" className="font-semibold text-support underline">
          Bekijk het hele werkgebied
        </Link>
        .
      </p>
    </main>
  );
}

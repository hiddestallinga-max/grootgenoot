import Link from "next/link";

type Tile = {
  key: string;
  title: string;
  tagline: string;
  href: string | null; // null = binnenkort
  accent: string; // tailwind arbitrary color klasse-basis
};

const tiles: Tile[] = [
  {
    key: "samen",
    title: "Groot Samen",
    tagline: "Ouderen brengen elkaar samen — in groepen of één-op-één.",
    href: null,
    accent: "samen",
  },
  {
    key: "sport",
    title: "Groot Sport",
    tagline: "Samen bewegen, opgehaald met de plusbus. Binnen of buiten.",
    href: null,
    accent: "sport",
  },
  {
    key: "support",
    title: "Groot Support",
    tagline:
      "De kern. Vind ondersteuning, of word grootgenoot en help iemand.",
    href: "/groot-support",
    accent: "support",
  },
  {
    key: "smaakt",
    title: "Groot Smaakt",
    tagline: "Samen koken en eten in een gezellige eetclub.",
    href: null,
    accent: "smaakt",
  },
];

function accentStyles(accent: string) {
  const map: Record<string, { bar: string; badge: string }> = {
    samen: { bar: "bg-samen", badge: "text-samen" },
    sport: { bar: "bg-sport", badge: "text-sport" },
    support: { bar: "bg-support", badge: "text-support" },
    smaakt: { bar: "bg-smaakt", badge: "text-smaakt" },
  };
  return map[accent] ?? map.support;
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <header className="mb-12 text-center">
        <p className="mb-3 text-lg font-semibold tracking-wide text-support">
          GrootGenoot
        </p>
        <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Samen tegen vergrijzing
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-muted">
          Zorg waar het écht telt — zelfs al is het maar een kwartiertje.
          GrootGenoot verbindt ouderen met mensen die willen ondersteunen.
        </p>
      </header>

      <section aria-label="Onderdelen" className="grid gap-6 sm:grid-cols-2">
        {tiles.map((tile) => {
          const styles = accentStyles(tile.accent);
          const isActive = tile.href !== null;

          const inner = (
            <div className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
              <span className={`mb-4 h-1.5 w-14 rounded-full ${styles.bar}`} />
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-ink">{tile.title}</h2>
                {!isActive && (
                  <span className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-sm font-semibold text-muted">
                    Binnenkort
                  </span>
                )}
              </div>
              <p className="text-lg leading-relaxed text-muted">
                {tile.tagline}
              </p>
              {isActive && (
                <span
                  className={`mt-5 inline-flex items-center gap-2 text-lg font-semibold ${styles.badge}`}
                >
                  Ga naar {tile.title}
                  <span aria-hidden="true">→</span>
                </span>
              )}
            </div>
          );

          if (isActive) {
            return (
              <Link
                key={tile.key}
                href={tile.href as string}
                className="group block focus:outline-none"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={tile.key}
              className="group block cursor-default opacity-80"
              aria-disabled="true"
            >
              {inner}
            </div>
          );
        })}
      </section>

      <footer className="mt-16 border-t border-black/10 pt-8 text-center text-base text-muted">
        <p>
          GrootGenoot — in samenwerking met huisarts, buurtzorg en
          verzorgingstehuizen.
        </p>
      </footer>
    </main>
  );
}

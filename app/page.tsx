import GlasKaart from "@/components/GlasKaart";

/* Simpele lijn-iconen (zelfde stijl: dunne lijnen, afgeronde hoeken) */
function IcoonSupport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9" aria-hidden="true">
      <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6Z" />
    </svg>
  );
}
function IcoonSamen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.6a4.5 4.5 0 0 1 6 4.4" />
    </svg>
  );
}
function IcoonSport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <path d="M3 12h4l2.5-6 4 12L16 12h5" />
    </svg>
  );
}
function IcoonSmaakt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="13" r="3" />
      <path d="M9 3.5v1M12 2.5v2M15 3.5v1" />
    </svg>
  );
}
function IcoonTransport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M3 10h18M9 4v6M15 4v6" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  );
}

const kleineTegels = [
  {
    key: "samen",
    titel: "Groot Samen",
    tekst: "Elkaar ontmoeten, in groepen of één-op-één.",
    kleur: "text-samen",
    icoon: <IcoonSamen />,
  },
  {
    key: "sport",
    titel: "Groot Sport",
    tekst: "Samen bewegen, binnen of buiten.",
    kleur: "text-sport",
    icoon: <IcoonSport />,
  },
  {
    key: "smaakt",
    titel: "Groot Smaakt",
    tekst: "Samen koken en eten in een eetclub.",
    kleur: "text-samen",
    icoon: <IcoonSmaakt />,
  },
  {
    key: "transport",
    titel: "Groot Transport",
    tekst: "Vervoer naar activiteiten en afspraken.",
    kleur: "text-sport",
    icoon: <IcoonTransport />,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Hulp en gezelschap aan huis
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">
          Onze aanpak voor vergrijzing: mensen uit de buurt die voor je
          klaarstaan — ook voor een kwartiertje.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-4">
        <GlasKaart
          href="/groot-support/hulp-zoeken"
          volgKracht={14}
          kantelKracht={7}
          className="bg-support/90 border-support/40 px-8 py-4"
        >
          <span className="text-xl font-bold text-white">Ik zoek hulp</span>
        </GlasKaart>
        <GlasKaart
          href="/groot-support/helpen"
          volgKracht={14}
          kantelKracht={7}
          className="px-8 py-4"
        >
          <span className="text-xl font-bold text-support">Ik wil helpen</span>
        </GlasKaart>
      </div>

      <section aria-label="Onderdelen" className="mt-12">
        <GlasKaart href="/groot-support" className="p-7">
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-support/10 text-support">
              <IcoonSupport />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-ink">Groot Support</h2>
              <p className="mt-1 text-lg leading-relaxed text-muted">
                De kern: vind ondersteuning, of word grootgenoot en help iemand
                in de buurt.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="hidden text-2xl font-bold text-support transition group-hover:translate-x-1 sm:block"
            >
              →
            </span>
          </div>
        </GlasKaart>

        <p className="mt-10 text-base font-semibold text-muted">
          Binnenkort ook:
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kleineTegels.map((tegel) => (
            <GlasKaart
              key={tegel.key}
              className="h-full p-4"
              volgKracht={6}
              kantelKracht={3}
            >
              <div className="flex items-center gap-3">
                <span className={`${tegel.kleur} shrink-0 [&>svg]:h-6 [&>svg]:w-6`}>
                  {tegel.icoon}
                </span>
                <h3 className="text-lg font-bold leading-tight text-ink">
                  {tegel.titel}
                </h3>
              </div>
            </GlasKaart>
          ))}
        </div>
      </section>
    </main>
  );
}

// Vertrouwenssignalen: de belangrijkste reden dat mensen (en hun kinderen)
// wél of niet iemand in huis durven te vragen. Zichtbaar bij elke belangrijke
// beslissing op de site.

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
  "aria-hidden": true,
};

const badges = [
  {
    tekst: "VOG en referenties gecheckt",
    icoon: (
      <svg {...svgProps}>
        <path d="M12 3 4 6v6c0 4.5 3.4 7.4 8 9 4.6-1.6 8-4.5 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    tekst: "Gedreven, zorgvuldig gekozen",
    icoon: (
      <svg {...svgProps}>
        <path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.2l5.4-.8L12 3.5Z" />
      </svg>
    ),
  },
  {
    tekst: "Gratis & vrijblijvend kennismaken",
    icoon: (
      <svg {...svgProps}>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M3 12h18M12 8v13" />
        <path d="M12 8c-1.5-3-6-3-6 0 0 1.5 3 1.5 6 0Zm0 0c1.5-3 6-3 6 0 0 1.5-3 1.5-6 0Z" />
      </svg>
    ),
  },
  {
    tekst: "Eén vast aanspreekpunt",
    icoon: (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      </svg>
    ),
  },
  {
    tekst: "Lokaal, iemand uit de buurt",
    icoon: (
      <svg {...svgProps}>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

export default function Vertrouwensbadges({
  className = "",
}: {
  className?: string;
}) {
  return (
    <ul
      className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}
      aria-label="Waarom Grootgenoot te vertrouwen is"
    >
      {badges.map((b) => (
        <li
          key={b.tekst}
          className="flex items-center gap-2.5 text-base font-semibold text-ink"
        >
          <span className="text-support">{b.icoon}</span>
          {b.tekst}
        </li>
      ))}
    </ul>
  );
}

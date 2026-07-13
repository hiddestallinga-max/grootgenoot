"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Altijd zichtbare actiebalk op mobiel: bellen of gratis kennismaken. Zo is de
// belangrijkste stap nooit meer dan één tik weg. Verborgen op de regiekamer,
// betaal-/tokenpagina's en de aanmeldpagina's zelf (daar is de actie al in beeld).
const verborgenPrefix = ["/admin", "/uren", "/stripe"];
const verborgenExact = [
  "/groot-support/hulp-zoeken",
  "/groot-support/helpen",
];

export default function StickyCTA() {
  const pad = usePathname() ?? "";
  const verberg =
    verborgenPrefix.some((p) => pad.startsWith(p)) ||
    verborgenExact.includes(pad);
  if (verberg) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <a
          href="tel:+31612154010"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-support px-3 py-2 text-base font-bold text-support transition active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M6.5 3.5 9 4l1 3.5-1.8 1.4a12 12 0 0 0 5.4 5.4L15 15.5l3.5 1L19 19a2 2 0 0 1-2 1.8A15 15 0 0 1 3.2 7 2 2 0 0 1 5 5l1.5-1.5Z" />
          </svg>
          Bel ons
        </a>
        <Link
          href="/groot-support/hulp-zoeken"
          className="flex flex-[1.5] items-center justify-center rounded-lg bg-support px-3 py-2 text-base font-bold text-white transition active:scale-95"
        >
          Kennismaken
        </Link>
      </div>
    </div>
  );
}

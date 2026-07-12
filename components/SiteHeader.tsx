"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const links = [
  { href: "/groot-support", label: "Hulp" },
  { href: "/over", label: "Over" },
  { href: "/tarieven", label: "Tarieven" },
  { href: "/contact", label: "Contact" },
  { href: "/groot-support/mijn-aanmelding", label: "Registratie" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Grootgenoot, naar de startpagina"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/grootgenoot-beeldmerk.svg"
            alt="Grootgenoot"
            width={86}
            height={74}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop navigatie */}
        <nav className="hidden items-center gap-6 text-lg font-semibold md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink transition hover:text-support"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobiele menuknop */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobiel-menu"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-ink transition hover:bg-ink/5 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            {open ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobiel uitklapmenu */}
      {open && (
        <nav
          id="mobiel-menu"
          className="border-t border-ink/10 bg-white/95 backdrop-blur-md md:hidden"
        >
          <div className="mx-auto flex max-w-5xl flex-col px-5 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2 py-3 text-lg font-semibold text-ink transition hover:bg-ink/5 hover:text-support"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

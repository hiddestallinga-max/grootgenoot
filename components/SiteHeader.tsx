import Link from "next/link";
import LogoIcoon from "./LogoIcoon";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          aria-label="Grootgenoot, naar de startpagina"
          className="flex items-center gap-2.5"
        >
          <LogoIcoon className="h-9 w-auto" />
          <span className="text-xl font-bold text-ink">
            groot<span className="text-samen">·</span>ge
            <span className="text-samen">·</span>noot
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-lg font-semibold">
          <Link href="/groot-support" className="text-ink transition hover:text-support">
            Hulp
          </Link>
          <Link href="/over" className="text-ink transition hover:text-support">
            Over
          </Link>
          <Link href="/tarieven" className="text-ink transition hover:text-support">
            Tarieven
          </Link>
          <Link href="/contact" className="text-ink transition hover:text-support">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <nav className="flex flex-wrap gap-x-6 gap-y-1 text-base">
          <Link href="/over" className="underline hover:text-white">
            Over Grootgenoot
          </Link>
          <Link href="/tarieven" className="underline hover:text-white">
            Tarieven
          </Link>
          <Link href="/contact" className="underline hover:text-white">
            Contact
          </Link>
          <Link href="/privacy" className="underline hover:text-white">
            Privacyverklaring
          </Link>
        </nav>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/60">
          <span>KvK 42103745</span>
          <span>BTW NL005497451B95</span>
          <span>IBAN: NL59 ASNB 0708 8601 92</span>
          <span>De Steeg</span>
        </div>
      </div>
    </footer>
  );
}

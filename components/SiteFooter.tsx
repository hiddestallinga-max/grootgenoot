import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <div>
            <Link
              href="/"
              aria-label="Grootgenoot, naar de startpagina"
              className="inline-flex rounded-2xl bg-white px-4 py-3"
            >
              <Image
                src="/grootgenoot-logo.svg"
                alt="Grootgenoot"
                width={316}
                height={92}
                className="h-11 w-auto"
              />
            </Link>
          </div>
          <div className="text-base">
            <p>
              <a
                href="mailto:info@grootgenoot.nl"
                className="font-semibold text-white underline"
              >
                info@grootgenoot.nl
              </a>
            </p>
            <p className="mt-1">
              <a href="tel:+31612154010" className="font-semibold text-white underline">
                06 12154010
              </a>
            </p>
            <p className="mt-1">
              <Link href="/over" className="underline hover:text-white">
                Over Grootgenoot
              </Link>{" "}
              ·{" "}
              <Link href="/tarieven" className="underline hover:text-white">
                Tarieven
              </Link>{" "}
              ·{" "}
              <Link href="/contact" className="underline hover:text-white">
                Contact
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="underline hover:text-white">
                Privacyverklaring
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/15 pt-6 text-sm text-white/60">
          <span>KvK 42103745</span>
          <span>BTW NL005497451B95</span>
          <span>IBAN: NL59 ASNB 0708 8601 92</span>
          <span>De Steeg</span>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

const beschrijving =
  "Grootgenoot koppelt ouderen aan iemand uit de buurt voor hulp en gezelschap, thuis en op pad. Betrouwbaar, met VOG en één vast aanspreekpunt.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Grootgenoot | Hulp en gezelschap uit de buurt",
  description: beschrijving,
  applicationName: "Grootgenoot",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Grootgenoot",
    url: SITE_URL,
    title: "Grootgenoot | Hulp en gezelschap uit de buurt",
    description: beschrijving,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Grootgenoot — hulp en gezelschap uit de buurt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grootgenoot | Hulp en gezelschap uit de buurt",
    description: beschrijving,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="flex min-h-screen flex-col antialiased">
        {/* Zachte kleurvlekken achter alles; de glazen tegels vervagen ze. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div
            className="blob"
            style={{ top: "-120px", left: "-100px", width: "420px", height: "420px", background: "rgba(24, 95, 165, 0.18)" }}
          />
          <div
            className="blob"
            style={{ top: "160px", right: "-140px", width: "480px", height: "480px", background: "rgba(15, 110, 86, 0.15)", animationDelay: "-6s" }}
          />
          <div
            className="blob"
            style={{ bottom: "-160px", left: "30%", width: "520px", height: "520px", background: "rgba(44, 110, 143, 0.14)", animationDelay: "-11s" }}
          />
        </div>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

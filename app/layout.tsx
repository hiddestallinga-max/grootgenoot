import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrootGenoot — samen tegen vergrijzing",
  description:
    "GrootGenoot verbindt ouderen met mensen die willen ondersteunen. Zorg waar het écht telt — zelfs al is het een kwartiertje.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

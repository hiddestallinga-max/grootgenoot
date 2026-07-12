import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PLAATSEN } from "@/lib/plaatsen";

// Publieke, indexeerbare pagina's. Admin, API, betaal- en tokenpagina's
// horen hier niet in (zie robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const nu = new Date();

  const vast = [
    "",
    "/over",
    "/tarieven",
    "/werkgebied",
    "/contact",
    "/privacy",
    "/groot-support",
    "/groot-support/hulp-zoeken",
    "/groot-support/helpen",
    "/groot-support/mijn-aanmelding",
  ].map((pad) => ({
    url: `${SITE_URL}${pad}`,
    lastModified: nu,
    changeFrequency: (pad === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: pad === "" ? 1 : pad === "/tarieven" ? 0.8 : 0.6,
  }));

  const plaatsen = PLAATSEN.map((p) => ({
    url: `${SITE_URL}/hulp-in/${p.slug}`,
    lastModified: nu,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...vast, ...plaatsen];
}

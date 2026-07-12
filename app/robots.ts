import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Privé of niet-inhoudelijk: regiekamer, API, betaal- en tokenpagina's.
      disallow: [
        "/admin",
        "/api/",
        "/uren",
        "/stripe/",
        "/groot-support/mijn-aanmelding/bewerken",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

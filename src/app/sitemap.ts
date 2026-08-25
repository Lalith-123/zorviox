import type { MetadataRoute } from "next";
import { SITE, TOOLS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...TOOLS.map((tool) => ({
      url: `${SITE.url}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}

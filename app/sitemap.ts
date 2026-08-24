import type { MetadataRoute } from "next";

import { brand } from "@/lib/brand";
import { toolPages } from "@/lib/tool-pages";

/** Public marketing routes only — /dashboard, /account etc. are behind
 * auth and gain nothing from being indexed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/tools", "/pricing", "/examples", "/editor", "/terms", "/privacy"];

  const toolRoutes = toolPages.map((page) => `/tools/${page.slug}`);

  return [...staticRoutes, ...toolRoutes].map((route) => ({
    url: `${brand.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}

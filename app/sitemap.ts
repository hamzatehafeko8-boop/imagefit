import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/tools/image-compressor",
    "/tools/image-resizer",
    "/tools/image-converter",
    "/guides",
    "/guides/reduce-image-size",
    "/guides/image-dimensions-and-aspect-ratio",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/tools") ? 0.9 : 0.7,
  }));
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://generationalturning.ca";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/design`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/inspiration`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}

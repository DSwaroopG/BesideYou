import type { MetadataRoute } from "next";
import { segments } from "@/content/segments";
import { siteUrl } from "@/lib/metadata";
export default function sitemap(): MetadataRoute.Sitemap {
 return ["", "/solutions", "/how-it-works", "/who-we-help", "/why-besideyou", "/contact", ...segments.map(segment => `/outbound/${segment.slug}`)].map(path => ({ url:`${siteUrl}${path}` }));
}

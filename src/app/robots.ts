import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";
// Crawl everything people should find; keep the booking endpoint and the thank-you page out.
export default function robots(): MetadataRoute.Robots {
 return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/contact/sent"] }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}

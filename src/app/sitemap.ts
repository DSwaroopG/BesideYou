import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";
// The pages we want in search. The /outbound/* pages still carry pre-pivot copy, so they are left
// out (and marked noindex) until they're rewritten.
const pages: Array<[string, number]> = [["", 1], ["/solutions", .9], ["/how-it-works", .9], ["/who-we-help", .8], ["/why-besideyou", .8], ["/contact", .7]];
export default function sitemap(): MetadataRoute.Sitemap {
 const lastModified = new Date();
 return pages.map(([path, priority]) => ({ url: `${siteUrl}${path}`, lastModified, changeFrequency: "monthly", priority }));
}

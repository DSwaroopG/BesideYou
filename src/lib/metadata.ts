import type { Metadata } from "next";
export const siteUrl = "https://besideyou.io";

// Per-page metadata: title (kept under ~60 characters), description (under ~160), canonical URL,
// indexing, and Open Graph / X cards. Share images come from each route's opengraph-image.tsx
// (file-based metadata wins over anything set here); the image named here is only a fallback.
export function pageMetadata(title: string, description: string, path: string, index = true): Metadata {
 return {
  title, description,
  alternates: { canonical: `${siteUrl}${path}` },
  robots: index ? { index: true, follow: true } : { index: false, follow: true },
  // Fallback image for pages without their own opengraph-image.tsx (their own file replaces it).
  openGraph: { type: "website", siteName: "BesideYou", locale: "en_US", title, description, url: `${siteUrl}${path}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BesideYou" }] },
  twitter: { card: "summary_large_image", title, description },
 };
}

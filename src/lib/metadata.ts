import type { Metadata } from "next";
export const siteUrl = "https://besideyou.io";
export function pageMetadata(title: string, description: string, path: string, index = true): Metadata {
 return { title, description, alternates: { canonical: `${siteUrl}${path}` }, robots: { index }, openGraph: { type:"website", siteName:"BesideYou", title, description, url:`${siteUrl}${path}`, images:[{ url:"/og-image.png", width:1200, height:630, alt:"Outbound infrastructure for founder-led technical teams" }] }, twitter: { card:"summary_large_image", title, description, images:["/og-image.png"] } };
}

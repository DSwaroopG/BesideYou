import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader, SiteFooter } from "@/components/structure";
import { PageTransition } from "@/components/page-transition";
import { Arrival } from "@/components/arrival";
import { SessionEntrance } from "@/components/session-entrance";
import { SectionRules } from "@/components/section-rules";
import { OrganizationData, WebsiteData } from "@/components/structured-data";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500"], display: "swap", preload: true, variable: "--font-instrument" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", preload: true, variable: "--font-plex" });

// Site-wide defaults; each page sets its own title, description and canonical (lib/metadata.ts).
// Icons come from app/icon.png and app/apple-icon.png; share images from each route's
// opengraph-image.tsx. Google Search Console: set GOOGLE_SITE_VERIFICATION in Vercel to the code
// Search Console gives you (the "HTML tag" method), and it is added to every page.
export const metadata: Metadata = {
 metadataBase: new URL("https://besideyou.io"),
 title: "BesideYou",
 description: "BesideYou finds your buyers through cold email and books sales calls with them. You pay only when a call with the right buyer happens.",
 applicationName: "BesideYou",
 ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};
export const viewport: Viewport = { themeColor: "#F4F2ED" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${instrument.variable} ${plex.variable}`}><body><OrganizationData /><WebsiteData /><SessionEntrance /><SectionRules /><SiteHeader /><main id="main-content" className="by-wrap"><PageTransition>{children}</PageTransition></main><SiteFooter /><Arrival /></body></html>;
}

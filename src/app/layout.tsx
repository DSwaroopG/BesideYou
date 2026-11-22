import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader, SiteFooter } from "@/components/structure";
import { PageTransition } from "@/components/page-transition";
import { Arrival } from "@/components/arrival";
import { SessionEntrance } from "@/components/session-entrance";
import { SectionRules } from "@/components/section-rules";
import { OrganizationData } from "@/components/structured-data";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500"], display: "swap", preload: true, variable: "--font-instrument" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", preload: true, variable: "--font-plex" });

export const metadata: Metadata = { metadataBase:new URL("https://besideyou.io"), icons:{ icon:{ url:"/_next/image?url=%2Fby-logo.png&w=32&q=75", sizes:"32x32" } }, title: "BesideYou", description: "Outbound infrastructure for founder-led technical teams" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${instrument.variable} ${plex.variable}`}><body><OrganizationData /><SessionEntrance /><SectionRules /><SiteHeader /><main id="main-content" className="by-wrap"><PageTransition>{children}</PageTransition></main><SiteFooter /><Arrival /></body></html>;
}

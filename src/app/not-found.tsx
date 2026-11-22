import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { LostFace } from "@/components/lost-face";
import "./not-found.css";

// Every unmatched URL lands here (root not-found). It points people back to the pages that exist.
export const metadata: Metadata = { title: "Page not found | BesideYou", robots: { index: false } };

const places = [
 { href: "/", label: "Home", line: "Start from the top." },
 { href: "/solutions", label: "Solutions", line: "Everything the system does for you." },
 { href: "/how-it-works", label: "How it works", line: "What happens after you say yes." },
 { href: "/who-we-help", label: "Who we help", line: "Four kinds of firm we know well." },
 { href: "/why-besideyou", label: "Why BesideYou", line: "Why we only get paid when a call lands." },
 { href: "/contact", label: "Book a strategy call", line: "Bring your hard questions." },
] as const;

export default function NotFound() {
 return <section className="nf by-grid" aria-labelledby="nf-title">
  <div className="nf-head">
   <LostFace />
   <p className="by-eyebrow nf-code">Error 404</p>
   <h1 id="nf-title" className="nf-title">We looked everywhere for this page.</h1>
   <p className="by-lead nf-lead">It may have moved when we tidied up the site, or the link has a typo in it. Here’s where everything lives now.</p>
  </div>
  <nav className="nf-places" aria-label="Pages on this site">
   <ol>{places.map((place, k) => <li style={{ "--k": k } as CSSProperties} key={place.href}>
    <Link href={place.href}><span className="nf-num" aria-hidden="true">{String(k + 1).padStart(2, "0")}</span><span className="nf-label">{place.label}</span><span className="nf-line">{place.line}</span><span className="nf-arrow" aria-hidden="true">↗</span></Link>
   </li>)}</ol>
  </nav>
 </section>;
}

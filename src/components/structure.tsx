import Link from "next/link";
import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { SiteNav } from "@/components/site-nav";
import { LocalTime } from "@/components/local-time";
import { FooterMotion } from "@/components/footer-motion";
// Footer (owner's list, 2026-11-16): logo and one-line positioning, company information, navigation,
// the six solutions, contact email and social links, Privacy and Terms. The /outbound segment
// pages still carry pre-pivot copy and stay unlinked until the deferred SEO phase.
import { solutions } from "@/content/solutions";

const FOOTER_TAGLINE = "The system that finds your clients, built for you.";

// Pre-pivot CTA. Still used by home-closing and segment-page until those are reworked for v3.0.
export function PilotLink() {
  return <Link className="by-action" href="/the-pilot">Start with a Pilot<span aria-hidden="true">↗</span></Link>;
}

// v3.0 visitor action: the brief form on /contact.
export function BookCallLink() {
  return <Link className="by-action" href="/contact">Book a Strategy Call<span aria-hidden="true">↗</span></Link>;
}

export function SiteHeader() {
  return <header className="by-top" style={{ viewTransitionName: "site-header" }}><nav className="by-wrap by-navigation" aria-label="BesideYou"><Link className="by-mark" href="/" aria-label="BesideYou"><Image src="/by-logo.png" width={48} height={48} sizes="48px" loading="eager" alt="" /><span className="by-wordmark">Beside<span>You</span></span></Link><SiteNav cta={<BookCallLink />} menuCta={<BookCallLink />} /></nav></header>;
}

export function SiteFooter() {
  return <footer className="by-foot" id="site-footer"><FooterMotion /><div className="by-wrap"><div className="by-foot-grid">
   <div className="by-foot-brand"><Link className="by-foot-mark" href="/" aria-label="BesideYou home"><Image src="/by-logo-light.png" width={46} height={34} sizes="46px" alt=""/><span className="by-foot-wordmark">Beside<span>You</span></span></Link><p>{FOOTER_TAGLINE}</p><p className="by-foot-company">Bhubaneswar, Odisha, India</p></div>
   <nav aria-label="Explore"><p className="by-foot-label">Explore</p><ul><li><Link href="/">Home</Link></li><li><Link href="/solutions">Solutions</Link></li><li><Link href="/how-it-works">How it works</Link></li><li><Link href="/who-we-help">Who we help</Link></li><li><Link href="/why-besideyou">Why BesideYou</Link></li><li><Link href="/contact">Book a strategy call</Link></li></ul></nav>
   <nav aria-label="Solutions"><p className="by-foot-label">Solutions</p><ul>{solutions.items.map(item => <li key={item.id}><Link href={`/solutions#${item.id}`}>{item.name}</Link></li>)}</ul></nav>
   <div><p className="by-foot-label">Contact</p><ul><li><a className="by-foot-mail" href="mailto:hello@besideyou.io">hello@besideyou.io</a></li><li><a href="https://www.linkedin.com/company/wearebesideyou">LinkedIn</a></li><li><a href="https://x.com/besideyou_io">X</a></li><li><a href="https://www.instagram.com/wearebesideyou">Instagram</a></li></ul></div>
  </div><div className="by-foot-bottom"><p>© {new Date().getFullYear()} BesideYou · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></p><p>Bhubaneswar<LocalTime /></p></div></div></footer>;
}

// Page intro: the title on the left and the lead beside it on wide screens (stacked on phones). The
// title's words rise in one after another (CSS only, see .by-intro in globals.css); the words stay
// plain text in the h1, so screen readers and the no-JS page read it normally.
export function PageIntro({ title, lead, label }: { title: string; lead?: string; label?: string }) {
  const words = title.split(" ");
  return <div className="by-intro by-grid">{label && <p className="by-eyebrow by-span12 by-intro-label">{label}</p>}<h1 className="by-span8 by-intro-title">{words.map((word, i) => <Fragment key={i}>{i > 0 && " "}<span className="by-intro-word" style={{ "--i": i } as CSSProperties}><span>{word}</span></span></Fragment>)}</h1>{lead && <p className="by-lead by-intro-lead">{lead}</p>}</div>;
}

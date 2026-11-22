"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { LocalTime } from "@/components/local-time";

const navigation = [
 { label: "Solutions", href: "/solutions" },
 { label: "How It Works", href: "/how-it-works" },
 { label: "Who We Help", href: "/who-we-help" },
 { label: "Why BesideYou", href: "/why-besideyou" },
] as const;

// Logo is Home on desktop; the menu lists it. Resources comes later (recommendation: not at launch).
const menu = [{ label: "Home", href: "/" }, ...navigation] as const;

function isCurrent(pathname: string, href: string) {
 return pathname === href || (href === "/who-we-help" && pathname.startsWith("/outbound/"));
}

export function SiteNav({ cta, menuCta }: { cta: ReactNode; menuCta: ReactNode }) {
 const pathname = usePathname();
 // The brief form lives on /contact (and /contact/sent confirms it), so the CTA would point at
 // the page you are on or ask you to book again.
 const showCta = !pathname.startsWith("/contact");
 const navRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const nav = navRef.current;
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a"));
  const dot = nav.querySelector<HTMLElement>(".by-nav-dot");
  if (!dot) return;
  let frame = 0;
  const current = () => links.find(link => link.getAttribute("aria-current") === "page") ?? null;
  const place = (link: HTMLAnchorElement | null) => {
   dot.style.opacity = link ? "1" : "0";
   if (link) dot.style.transform = `translateX(${link.offsetLeft + link.offsetWidth / 2 - 3}px)`;
  };
  const measure = () => {
   nav.dataset.ready = "false";
   place(links.find(link => link.matches(":hover, :focus")) ?? current());
   cancelAnimationFrame(frame);
   frame = requestAnimationFrame(() => { nav.dataset.ready = "true"; });
  };
  const enter = (event: Event) => place(event.currentTarget as HTMLAnchorElement);
  const leave = () => place(current());
  const focusout = (event: FocusEvent) => {
   if (!nav.contains(event.relatedTarget as Node | null)) leave();
  };
  links.forEach(link => {
   link.addEventListener("pointerenter", enter);
   link.addEventListener("focus", enter);
  });
  nav.addEventListener("pointerleave", leave);
  nav.addEventListener("focusout", focusout);
  nav.dataset.enhanced = "true";
  measure();
  const resize = new ResizeObserver(measure);
  resize.observe(nav);
  return () => {
   cancelAnimationFrame(frame);
   resize.disconnect();
   links.forEach(link => {
    link.removeEventListener("pointerenter", enter);
    link.removeEventListener("focus", enter);
   });
   nav.removeEventListener("pointerleave", leave);
   nav.removeEventListener("focusout", focusout);
  };
 }, [pathname]);

 useEffect(() => {
  const popover = document.getElementById("site-menu");
  if (popover?.matches(":popover-open")) popover.hidePopover();
 }, [pathname]);

 return <>
  <div ref={navRef} className="by-navlinks">
   {navigation.map(item => <Link href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined} key={item.href}>{item.label}</Link>)}
   <span className="by-nav-dot" aria-hidden="true"></span>
  </div>
  <div className="by-header-pilot">{showCta && cta}</div>
  <button type="button" className="by-menu-button" popoverTarget="site-menu"><i aria-hidden="true"></i><span>Menu</span></button>
  <div id="site-menu" className="by-menu" popover="auto">
   <div className="by-menu-top"><div className="by-wrap by-menu-bar">
    <Link className="by-mark" href="/" aria-label="BesideYou"><Image src="/by-logo.png" width={48} height={48} sizes="48px" loading="eager" alt=""/><span className="by-wordmark">Beside<span>You</span></span></Link>
    <button type="button" className="by-menu-button" popoverTarget="site-menu" popoverTargetAction="hide" autoFocus><i aria-hidden="true"></i><span>Close</span></button>
   </div></div>
   <nav className="by-wrap by-menu-index" aria-label="Site menu"><ol className="by-menu-list">
    {menu.map((item, index) => {
     const current = isCurrent(pathname, item.href);
     return <li style={{ "--i": index } as CSSProperties} key={item.href}><Link href={item.href} aria-current={current ? "page" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}{current && <i aria-hidden="true"></i>}</Link></li>;
    })}
   </ol>{showCta && <div className="by-menu-pilot" style={{ "--i": menu.length } as CSSProperties}>{menuCta}</div>}
   <div className="by-menu-contact" style={{ "--i": menu.length + 1 } as CSSProperties}>
    <a className="by-menu-mail" href="mailto:hello@besideyou.io">hello@besideyou.io</a>
    <p className="by-menu-social"><a href="https://www.linkedin.com/company/wearebesideyou">LinkedIn</a><a href="https://x.com/besideyou_io">X</a><a href="https://www.instagram.com/wearebesideyou">Instagram</a></p>
    <p className="by-menu-place">Bhubaneswar<LocalTime /></p>
   </div></nav>
  </div>
 </>;
}

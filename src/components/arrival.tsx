"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// When a link lands on a section (/solutions#booking, /how-it-works#hw-qual-title, or a same-page
// #link), briefly highlight what it pointed at, so the visitor sees where they arrived. Runs after
// the page transition settles. The Who We Help story handles its own deep links, so it's skipped.
const SETTLE = 560;    // ms: lets the page transition finish first
const HOLD = 2200;     // ms the highlight stays on

function mark(hash: string) {
 const id = decodeURIComponent(hash.replace(/^#/, ""));
 if (!id) return;
 const target = document.getElementById(id);
 if (!target || target.closest(".ww-examples")) return;
 // A Solutions card opens its detail, so the link lands on the answer, not just the heading.
 const more = target.querySelector<HTMLDetailsElement>("details.sc-more");
 if (more) more.open = true;
 target.removeAttribute("data-arrived");
 void target.offsetWidth; // restart the animation if it is already running
 target.setAttribute("data-arrived", "");
 window.setTimeout(() => target.removeAttribute("data-arrived"), HOLD);
}

export function Arrival() {
 const pathname = usePathname();

 // A new page (or the first load) with a hash.
 useEffect(() => {
  if (!location.hash) return;
  const timer = window.setTimeout(() => mark(location.hash), SETTLE);
  return () => clearTimeout(timer);
 }, [pathname]);

 // A #link to somewhere on the current page.
 useEffect(() => {
  const onClick = (event: MouseEvent) => {
   const link = (event.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
   if (!link) return;
   const url = new URL(link.href, location.href);
   if (url.pathname !== location.pathname || !url.hash) return;
   window.setTimeout(() => mark(url.hash), 420);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
 }, []);

 return null;
}

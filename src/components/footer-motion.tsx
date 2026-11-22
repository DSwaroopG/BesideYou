"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Footer link motion that CSS alone can't do: a gold pulse from the link's dot that plays out fully
// on click (not just while the button is held), and the current page marked in the footer.
export function FooterMotion() {
 const pathname = usePathname();

 useEffect(() => {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".by-foot-grid a:not(.by-foot-mark), .by-foot-bottom a"));
  links.forEach(link => {
   const url = new URL(link.href, location.href);
   if (url.origin === location.origin && url.pathname === pathname && !url.hash) link.setAttribute("aria-current", "page");
   else link.removeAttribute("aria-current");
  });
 }, [pathname]);

 useEffect(() => {
  const foot = document.querySelector<HTMLElement>(".by-foot");
  if (!foot) return;
  const press = (event: PointerEvent) => {
   const link = (event.target as Element | null)?.closest?.(".by-foot-grid a:not(.by-foot-mark), .by-foot-bottom a") as HTMLElement | null;
   if (!link) return;
   link.removeAttribute("data-pressed");
   void link.offsetWidth;
   link.setAttribute("data-pressed", "");
   window.setTimeout(() => link.removeAttribute("data-pressed"), 700);
  };
  foot.addEventListener("pointerdown", press);
  return () => foot.removeEventListener("pointerdown", press);
 }, []);

 return null;
}

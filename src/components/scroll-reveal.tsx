"use client";

import { useEffect } from "react";

// Scroll-in reveals for page sections (used by /how-it-works with .hw-rv and /who-we-help
// with .ww-rv; each page's CSS defines what [data-reveal=armed] and [data-reveal=in] look like).
// Every matched element renders in its final state (server HTML, no JS, reduced motion, print).
// After hydration, only elements still below the fold are armed; each one plays once as it
// scrolls into view. Elements entering together are staggered so a row of items cascades.
// All motion is opacity and transform (see how.css), so it stays on the compositor.
const STAGGER = 80;     // ms between elements that enter in the same frame
const MAX_DELAY = 480;  // cap so a long batch never feels late
const FOLD = .92;       // share of the viewport height counted as "already seen"

export function ScrollReveal({ selector }: { selector: string }) {
 useEffect(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;
  const fold = innerHeight * FOLD;
  const items = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(el => el.getBoundingClientRect().top > fold);
  if (!items.length) return;

  const play = (el: HTMLElement, delay: number) => {
   el.style.setProperty("--d", `${delay}ms`);
   el.dataset.reveal = "in";
  };
  const observer = new IntersectionObserver(entries => {
   entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
    .forEach((entry, index) => {
     observer.unobserve(entry.target);
     play(entry.target as HTMLElement, Math.min(index * STAGGER, MAX_DELAY));
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  items.forEach(el => { el.dataset.reveal = "armed"; observer.observe(el); });

  // If the page stalls during a fast scroll (a 3D scene loading on a slow device), an element can
  // pass from below the screen to above it without the observer ever seeing it on screen. Reveal
  // anything already scrolled past, so scrolling back never finds a blank gap.
  let frame = 0;
  const sweep = () => {
   frame = 0;
   let armed = 0;
   items.forEach(el => {
    if (el.dataset.reveal !== "armed") return;
    if (el.getBoundingClientRect().bottom < 0) { observer.unobserve(el); play(el, 0); } else armed++;
   });
   if (!armed) removeEventListener("scroll", onScroll);
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(sweep); };
  addEventListener("scroll", onScroll, { passive: true });

  const release = () => {
   if (!reduced.matches) return;
   observer.disconnect();
   items.forEach(el => play(el, 0));
  };
  reduced.addEventListener("change", release);
  return () => {
   observer.disconnect();
   cancelAnimationFrame(frame);
   removeEventListener("scroll", onScroll);
   reduced.removeEventListener("change", release);
   items.forEach(el => { delete el.dataset.reveal; el.style.removeProperty("--d"); });
  };
 }, [selector]);
 return null;
}

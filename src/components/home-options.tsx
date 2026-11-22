"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HomeOptions({ children }: { children: ReactNode }) {
 const root = useRef<HTMLElement>(null);

 useEffect(() => {
  const section = root.current!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 900px) and (min-height: 720px)");
  const armed = section.getBoundingClientRect().top > innerHeight && !reduced.matches;
  let cleanup: (() => void) | undefined, cancelled = false, loading = false;
  let lastY = scrollY, jumped = false;

  section.dataset.mode = reduced.matches ? "static" : desktop.matches ? "hold" : "reveal";
  if (!armed) return;
  section.dataset.state = "armed";
  const trackJump = () => {
   const current = scrollY;
   jumped = Math.abs(current - lastY) > innerHeight;
   lastY = current;
  };
  const observer = new IntersectionObserver(async ([entry]) => {
   if (!entry.isIntersecting || loading) return;
   loading = true; observer.disconnect(); removeEventListener("scroll", trackJump);
   const { enhanceOptions } = await import("@/components/home-options-motion");
   if (!cancelled) cleanup = enhanceOptions(section, { lastY, jumped });
  }, { rootMargin: "100% 0px" });
  addEventListener("scroll", trackJump, { passive: true }); observer.observe(section);
  return () => { cancelled = true; observer.disconnect(); removeEventListener("scroll", trackJump); cleanup?.(); };
 }, []);

 return <section ref={root} className="by-section by-opts" aria-labelledby="opts-title" data-mode="static" data-state="complete">{children}</section>;
}

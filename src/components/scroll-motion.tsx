"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function ScrollMotion({ kind, children }: { kind: "stack"; children: ReactNode }) {
 const root = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const element = root.current;
  if (!element) return;
  const permitted = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
  let frame = 0;
  const update = () => {
   frame = 0;
   element.dataset.motion = String(permitted.matches);
   if (!permitted.matches) { element.querySelectorAll<HTMLElement>(".by-step-layer,.by-step-card").forEach(card => { card.style.removeProperty("transform"); card.style.removeProperty("opacity"); }); return; }
   const cards = Array.from(element.querySelectorAll<HTMLElement>(".by-step-layer"));
   cards.forEach((card,index) => {
    const next = cards[index + 1];
    const overlap = next ? Math.max(0,Math.min(1, 1 - (next.getBoundingClientRect().top - (96 + (index + 1) * 36)) / Math.max(card.offsetHeight,1))) : 0;
    card.style.transform = `scale(${1 - overlap * .03})`;
    const face = card.querySelector<HTMLElement>(".by-step-card");
    if (face) face.style.opacity = String(1 - overlap * .2);
   });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  update();
  window.addEventListener("scroll", schedule, { passive:true });
  window.addEventListener("resize", schedule);
  permitted.addEventListener("change", schedule);
  return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); permitted.removeEventListener("change", schedule); };
 }, [kind]);
 return <div className={`by-motion-${kind}`} ref={root}>{children}</div>;
}

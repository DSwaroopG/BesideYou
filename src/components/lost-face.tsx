"use client";

import { useEffect, useRef } from "react";

// The logo face from the homepage closing, lost: on its own the eyes glance around as if looking for
// the page; with a mouse they follow the pointer. Decorative only. Reduced motion keeps it still.
const REACH = 7; // how far the pupils travel inside the eyes, in viewBox units

export function LostFace() {
 const root = useRef<SVGSVGElement>(null);

 useEffect(() => {
  const svg = root.current!;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, x = 0, y = 0, tx = 0, ty = 0, following = false, idle = 0;

  const tick = () => {
   x += (tx - x) * .14; y += (ty - y) * .14;
   svg.style.setProperty("--look-x", x.toFixed(2));
   svg.style.setProperty("--look-y", y.toFixed(2));
   frame = Math.abs(tx - x) + Math.abs(ty - y) > .01 ? requestAnimationFrame(tick) : 0;
  };
  const aim = (event: PointerEvent) => {
   if (!fine.matches || reduced.matches || event.pointerType === "touch") return;
   const box = svg.getBoundingClientRect();
   const dx = event.clientX - (box.left + box.width / 2), dy = event.clientY - (box.top + box.height * .35);
   const length = Math.hypot(dx, dy) || 1, pull = Math.min(1, length / 260);
   tx = dx / length * REACH * pull; ty = dy / length * REACH * pull;
   if (!following) { following = true; svg.dataset.follow = "true"; }
   clearTimeout(idle);
   idle = window.setTimeout(() => { following = false; svg.dataset.follow = "false"; tx = 0; ty = 0; if (!frame) frame = requestAnimationFrame(tick); }, 2600);
   if (!frame) frame = requestAnimationFrame(tick);
  };
  addEventListener("pointermove", aim, { passive: true });
  return () => { removeEventListener("pointermove", aim); cancelAnimationFrame(frame); clearTimeout(idle); };
 }, []);

 return <svg ref={root} className="nf-face" viewBox="56 18 130 102" aria-hidden="true" focusable="false" data-follow="false">
  <g className="nf-eyes">
   <circle className="nf-eye" cx="92" cy="44" r="17" />
   <circle className="nf-eye nf-eye-b" cx="150" cy="44" r="17" />
   <g className="nf-pupils"><circle cx="92" cy="44" r="5.5" /><circle cx="150" cy="44" r="5.5" /></g>
  </g>
  <path className="nf-mouth" d="M96 96 C 112 88, 130 104, 146 94" />
 </svg>;
}

"use client";

import { useEffect, useRef } from "react";
import { BookCallLink } from "@/components/structure";

export function HomeClosing() {
 const root = useRef<HTMLElement>(null);

 useEffect(() => {
  const section = root.current!;
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  if (!motion.matches || section.getBoundingClientRect().top <= innerHeight) return;
  let timer = 0;
  const finish = () => {
   clearTimeout(timer);
   observer.disconnect();
   section.dataset.state = "static";
  };
  const observer = new IntersectionObserver(([entry]) => {
   if (entry.intersectionRatio < .25) return;
   observer.disconnect();
   section.dataset.state = "playing";
   timer = window.setTimeout(finish, 1900);
  }, { threshold: .25 });
  const onMotion = () => { if (!motion.matches) finish(); };
  section.dataset.state = "armed";
  observer.observe(section);
  motion.addEventListener("change", onMotion);
  return () => {
   finish();
   motion.removeEventListener("change", onMotion);
  };
 }, []);

 return <section ref={root} className="by-section by-close" aria-labelledby="close-title" data-state="static">
  <div className="by-close-inner">
   <svg className="by-close-face" viewBox="56 22 130 98" aria-hidden="true" focusable="false">
    <circle className="by-close-eye" cx="92" cy="44" r="17" />
    <circle className="by-close-eye by-close-eye-b" cx="150" cy="44" r="17" />
    <path className="by-close-smile" d="M66 78 C 86 120, 156 120, 176 78" pathLength="1" />
   </svg>
   <h2 id="close-title" className="by-close-title">Your system. Beside you.</h2>
   <div className="by-close-cta"><BookCallLink /></div>
  </div>
 </section>;
}

"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const drawn = new Set<string>();
const selector = ".by-top,.by-section,.by-company,.by-questions details";

export function SectionRules() {
 const pathname = usePathname();
 useEffect(() => {
  const setup = () => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const hosts = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const keys = new Map<Element,string>();
  const observer = new IntersectionObserver(entries => {
   for (const entry of entries) if (entry.isIntersecting && entry.intersectionRatio >= .2) {
    entry.target.classList.remove("by-rule-pending");
    drawn.add(keys.get(entry.target)!);
    observer.unobserve(entry.target);
   }
  },{ threshold:.2 });
  hosts.forEach((host,index) => {
   const key = host.matches(".by-top") ? "by-top" : `${pathname}:${index}`;
   keys.set(host,key);
   host.classList.add("by-rule-host");
   if (!reduced.matches && !drawn.has(key)) {
    host.classList.add("by-rule-pending");
    observer.observe(host);
   }
  });
  const showAll = () => {
   if (!reduced.matches) return;
   observer.disconnect();
   hosts.forEach(host => { host.classList.remove("by-rule-pending"); drawn.add(keys.get(host)!); });
  };
  reduced.addEventListener("change",showAll);
  return () => { observer.disconnect(); reduced.removeEventListener("change",showAll); hosts.forEach(host => host.classList.remove("by-rule-pending")); };
  };
  // Leave the first content paint undisturbed; enhance only rules after load.
  let frame = 0;
  let cleanup: (() => void) | undefined;
  const start = () => { frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => { cleanup = setup(); }); }); };
  if (document.readyState === "complete") start();
  else window.addEventListener("load",start,{ once:true });
  return () => { window.removeEventListener("load",start); cancelAnimationFrame(frame); cleanup?.(); };
 },[pathname]);
 return null;
}

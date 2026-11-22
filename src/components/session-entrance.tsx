"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";

let shownThisLoad = false;

export function SessionEntrance() {
 const pathname = usePathname();
 const claimed = useRef(false);
 const [shown,setShown] = useState(false);
 const [started,setStarted] = useState(false);
 const [leaving,setLeaving] = useState(false);
 useEffect(() => { if (pathname.startsWith("/contact")) setShown(false); },[pathname]);
 useEffect(() => {
  // Keep a deep link's position (e.g. /who-we-help#managed-it); otherwise start at the top.
  try { history.scrollRestoration = "manual"; if (!location.hash) window.scrollTo(0,0); } catch { /* Scroll restrictions must not block rendering. */ }
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const remove = () => { cancelled = true; setShown(false); };
  // Independent of font readiness and animation completion; reserve paint time before 2000ms.
  timers.push(setTimeout(remove,1900));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const preferenceChanged = () => { if (reduced.matches) remove(); };
  reduced.addEventListener("change",preferenceChanged);
  if (shownThisLoad && !claimed.current) return () => { cancelled=true; timers.forEach(clearTimeout); reduced.removeEventListener("change",preferenceChanged); };
  shownThisLoad = true;
  claimed.current = true;
  if (!location.pathname.startsWith("/contact") && !reduced.matches) {
   setShown(true);
   void (async () => {
    try { await Promise.race([document.fonts.ready,new Promise(resolve => timers.push(setTimeout(resolve,600)))]); } catch { /* A font error still starts the bounded entrance. */ }
    if (cancelled) return;
    // A paint separates the initial letter positions from their settled positions.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => {
     if (cancelled) return;
     setStarted(true);
     timers.push(setTimeout(() => setLeaving(true),900));
     timers.push(setTimeout(remove,1220));
    }));
    if (cancelled) cancelAnimationFrame(frame);
   })();
  }
  return () => { cancelled=true; timers.forEach(clearTimeout); reduced.removeEventListener("change",preferenceChanged); };
 },[]);
 if (!shown) return null;
 return <div className="by-entrance" aria-hidden="true" data-started={started} data-leaving={leaving}><div>{Array.from("BesideYou").map((letter,index) => <span key={index} className={index > 5 ? "by-letter-purple" : undefined} style={{ "--letter-offset":`${(index-4)*11}px`, "--letter-delay":`${index*34}ms` } as CSSProperties}>{letter}</span>)}</div></div>;
}

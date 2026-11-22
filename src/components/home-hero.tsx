"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { HeroScene, HERO_BOOKED_EVENT } from "@/components/hero-scene";

const HERO = {
 muted: "The system that finds your clients",
 rest: "should belong to you, not to your agency.",
 // LOCKED rotation (brief): four segments, then rest on "and other founder-led B2B sellers."
 segments: ["AI and data teams.", "software studios.", "managed IT providers.", "B2B service firms.", "…and other founder-led B2B sellers."],
 spoken: "We build it for AI and data teams, software studios, managed IT providers, B2B service firms and other founder-led B2B sellers.",
 breakpoint: 768, samples: 96, waves: 2.5, phaseSpeed: .72,
 desktop: { bottom: 64, amplitude: 18 }, mobile: { bottom: 52, amplitude: 12 },
 harmonic: .28, frequency: 1.7, phaseRatio: 1.4, maxDt: .05,
 gatherSpeed: 5.3, pointerSpeed: 13.4, snapThreshold: .05, stagger: .35,
 radius: 18, dotRadius: 6, dotShrink: 2, tickStart: .8, tickGap: 4, tickLength: 7,
 entranceFallback: 2000, entranceEnd: 1800, subDelay: 800,
 drawDelay: 900, drawDuration: 1600, popDuration: 500, popScale: 1.4,
 pulseDuration: 500, pulseScale: 1.6, rollInterval: 2600,
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value < .5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;

export function HomeHero() {
 const root = useRef<HTMLElement>(null);
 const widths = useRef<number[]>([]);
 const motion = useRef({ width: 0, height: 0, phase: 0, g: 0, mx: 0, my: 0, tx: 0, ty: 0, inside: false, last: 0, drawTime: Infinity, pulseTime: Infinity });
 const [roll, setRoll] = useState<{ current: number; outgoing: number | null }>({ current: 0, outgoing: null });

 useEffect(() => {
  const section = root.current!;
  const svg = section.querySelector<SVGSVGElement>("svg")!;
  const path = section.querySelector<SVGPathElement>("path")!;
  const dot = section.querySelector<SVGCircleElement>("circle")!;
  const ticks = section.querySelectorAll<SVGLineElement>("line");
  const sub = section.querySelector<HTMLElement>(".by-hero-sub")!;
  const container = section.querySelector<HTMLElement>(".by-hero-roll")!;
  const cta = section.querySelector<HTMLAnchorElement>(".by-hero-cta a")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const m = motion.current;
  let disposed = false, visible = false, active = false, decided = reduced.matches;
  let frame = 0, firstFrame = 0, secondFrame = 0, fallback = 0, entranceEnd = 0;
  let rollTimer = 0, rollStarted = 0, current = 0;
  let remaining: number = HERO.rollInterval;
  let entranceObserver: MutationObserver | undefined;
  const mounted = performance.now();

  const measure = () => {
   const measurer = document.createElement("span");
   measurer.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;";
   sub.appendChild(measurer);
   widths.current = HERO.segments.map(segment => {
    measurer.textContent = segment;
    return measurer.getBoundingClientRect().width;
   });
   measurer.remove();
   container.style.width = `${widths.current[current]}px`;
  };
  const draw = () => {
   const size = window.innerWidth < HERO.breakpoint ? HERO.mobile : HERO.desktop;
   const base = m.height - size.bottom;
   const progress = 1 - (1 - clamp((m.drawTime - HERO.drawDelay) / HERO.drawDuration)) ** 3;
   const end = Math.round(progress * HERO.samples);
   let d = "", endX = 0, endY = 0;
   for (let i = 0; i <= HERO.samples; i++) {
    const u = i / HERO.samples;
    const x = u * m.width;
    const y = base + size.amplitude * Math.sin(2 * Math.PI * HERO.waves * u + m.phase) + HERO.harmonic * size.amplitude * Math.sin(2 * Math.PI * HERO.waves * HERO.frequency * u - HERO.phaseRatio * m.phase);
    const blend = ease(clamp((m.g - u * HERO.stagger) / (1 - HERO.stagger)));
    const angle = -Math.PI / 2 + u * Math.PI * 2;
    if (i <= end) d += `${i ? "L" : "M"}${(x + (m.tx + HERO.radius * Math.cos(angle) - x) * blend).toFixed(1)},${(y + (m.ty + HERO.radius * Math.sin(angle) - y) * blend).toFixed(1)}`;
    endX = x; endY = y;
   }
   path.setAttribute("d", d);
   const g = ease(m.g);
   dot.setAttribute("cx", (endX + (m.tx - endX) * g).toFixed(1));
   dot.setAttribute("cy", (endY + (m.ty - endY) * g).toFixed(1));
   const pop = clamp((m.drawTime - HERO.drawDelay - HERO.drawDuration) / HERO.popDuration);
   const scale = pop < .5 ? HERO.popScale * (1 - (1 - pop * 2) ** 3) : HERO.popScale + (1 - HERO.popScale) * (1 - (2 - pop * 2) ** 3);
   const pulse = clamp(m.pulseTime / HERO.pulseDuration);
   const pulseScale = 1 + (HERO.pulseScale - 1) * Math.sin(Math.PI * (1 - (1 - pulse) ** 3));
   dot.setAttribute("r", ((HERO.dotRadius - HERO.dotShrink * g) * scale * pulseScale).toFixed(2));
   dot.setAttribute("opacity", progress === 1 ? "1" : "0");
   const k = clamp((m.g - HERO.tickStart) / (1 - HERO.tickStart));
   ticks.forEach((tick, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 2;
    const near = HERO.radius + HERO.tickGap, far = near + HERO.tickLength * k;
    tick.setAttribute("x1", (m.tx + Math.cos(angle) * near).toFixed(1));
    tick.setAttribute("y1", (m.ty + Math.sin(angle) * near).toFixed(1));
    tick.setAttribute("x2", (m.tx + Math.cos(angle) * far).toFixed(1));
    tick.setAttribute("y2", (m.ty + Math.sin(angle) * far).toFixed(1));
    tick.setAttribute("opacity", k.toFixed(3));
   });
  };
  const animate = (now: number) => {
   const dt = m.last ? Math.min((now - m.last) / 1000, HERO.maxDt) : 0;
   m.last = now;
   m.phase += HERO.phaseSpeed * dt;
   m.g += ((m.inside ? 1 : 0) - m.g) * (1 - Math.exp(-HERO.gatherSpeed * dt));
   const smoothing = 1 - Math.exp(-HERO.pointerSpeed * dt);
   m.tx += (m.mx - m.tx) * smoothing; m.ty += (m.my - m.ty) * smoothing;
   if (section.dataset.entrance !== "pending") m.drawTime += dt * 1000;
   m.pulseTime += dt * 1000;
   draw();
   frame = requestAnimationFrame(animate);
  };
  const scheduleRoll = () => {
   if (!active || !decided || rollTimer) return;
   rollStarted = performance.now();
   rollTimer = window.setTimeout(() => {
    rollTimer = 0;
    const outgoing = current;
    current = Math.min(current + 1, HERO.segments.length - 1);
    setRoll({ current, outgoing });
    if (widths.current[current] !== undefined) container.style.width = `${widths.current[current]}px`;
    remaining = HERO.rollInterval;
    // The last segment is the resting frame: stop rolling there.
    if (current < HERO.segments.length - 1) scheduleRoll();
   }, remaining);
  };
  const syncActivity = () => {
   const next = visible && document.visibilityState === "visible" && !reduced.matches;
   section.dataset.active = String(next);
   if (next !== active) {
    active = next;
    if (active) { m.last = 0; frame = requestAnimationFrame(animate); }
    else {
     cancelAnimationFrame(frame);
     if (rollTimer) remaining = Math.max(0, remaining - (performance.now() - rollStarted));
     clearTimeout(rollTimer); rollTimer = 0;
    }
   }
   scheduleRoll();
  };
  const play = () => {
   entranceObserver?.disconnect(); clearTimeout(fallback);
   if (disposed || reduced.matches) return;
   section.dataset.entrance = "playing";
   m.drawTime = 0; m.last = performance.now();
   decided = true; remaining = HERO.subDelay + HERO.rollInterval;
   scheduleRoll();
   entranceEnd = window.setTimeout(() => { section.dataset.entrance = "done"; }, HERO.entranceEnd);
  };
  const mode = () => {
   const allowed = fine.matches && !reduced.matches;
   section.dataset.aim = allowed ? "on" : "off";
   if (!allowed) { m.inside = false; m.g = 0; }
   if (reduced.matches) {
    cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame);
    entranceObserver?.disconnect(); clearTimeout(fallback); clearTimeout(entranceEnd);
    decided = true; section.dataset.entrance = "static";
    m.phase = 0; m.drawTime = Infinity; m.pulseTime = Infinity;
    current = 0; remaining = HERO.rollInterval;
    setRoll({ current, outgoing: null });
    if (widths.current[0] !== undefined) container.style.width = `${widths.current[0]}px`;
    draw();
   }
   syncActivity();
   if (reduced.matches) remaining = HERO.rollInterval;
  };
  const pointer = (event: PointerEvent) => {
   if (event.pointerType === "touch" || !fine.matches || reduced.matches) return;
   // Over the illustration the line lets go, so the card can be read with a normal cursor.
   if ((event.target as Element | null)?.closest?.(".hs")) { m.inside = false; return; }
   const rect = section.getBoundingClientRect();
   m.mx = event.clientX - rect.left; m.my = event.clientY - rect.top;
   if (!m.inside && m.g < HERO.snapThreshold) { m.tx = m.mx; m.ty = m.my; }
   m.inside = true;
  };
  const leave = () => { m.inside = false; };
  const pulse = () => { if (!reduced.matches) m.pulseTime = 0; };
  const resize = new ResizeObserver(() => {
   const rect = section.getBoundingClientRect();
   m.width = rect.width; m.height = rect.height;
   svg.setAttribute("viewBox", `0 0 ${m.width} ${m.height}`);
   measure(); draw();
  });
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncActivity(); });
  resize.observe(section); intersection.observe(section);
  void document.fonts.ready.then(() => { if (!disposed) measure(); });
  document.addEventListener("visibilitychange", syncActivity);
  reduced.addEventListener("change", mode); fine.addEventListener("change", mode);
  section.addEventListener("pointerenter", pointer); section.addEventListener("pointermove", pointer); section.addEventListener("pointerleave", leave);
  cta.addEventListener("pointerenter", pulse);
  addEventListener(HERO_BOOKED_EVENT, pulse);
  mode();
  if (!reduced.matches) firstFrame = requestAnimationFrame(() => {
   secondFrame = requestAnimationFrame(() => {
    if (!document.querySelector(".by-entrance")) {
     decided = true; remaining = Math.max(0, HERO.rollInterval - (performance.now() - mounted)); scheduleRoll(); return;
    }
    section.dataset.entrance = "pending"; m.drawTime = 0;
    entranceObserver = new MutationObserver(() => { if (!document.querySelector(".by-entrance")) play(); });
    entranceObserver.observe(document.body, { childList: true, subtree: true });
    fallback = window.setTimeout(play, HERO.entranceFallback);
   });
  });
  return () => {
   disposed = true;
   cancelAnimationFrame(frame); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame);
   clearTimeout(fallback); clearTimeout(entranceEnd); clearTimeout(rollTimer);
   resize.disconnect(); intersection.disconnect(); entranceObserver?.disconnect();
   document.removeEventListener("visibilitychange", syncActivity);
   reduced.removeEventListener("change", mode); fine.removeEventListener("change", mode);
   section.removeEventListener("pointerenter", pointer); section.removeEventListener("pointermove", pointer); section.removeEventListener("pointerleave", leave);
   cta.removeEventListener("pointerenter", pulse);
   removeEventListener(HERO_BOOKED_EVENT, pulse);
  };
 }, []);

 const words = (text: string, offset: number) => text.split(" ").map((word, index) => <Fragment key={word + index}>{index > 0 && " "}<span className="by-hero-word" style={{ "--i": index + offset } as CSSProperties}><span>{word}</span></span></Fragment>);
 return <section ref={root} className="by-hero" aria-labelledby="hero-title" data-entrance="static" data-aim="off">
  <svg className="by-hero-line" aria-hidden="true" focusable="false"><path className="by-hero-path" />{[0, 1, 2, 3].map(i => <line key={i} opacity="0" />)}<circle className="by-hero-dot" r={HERO.dotRadius} opacity="0" /></svg>
  <h1 id="hero-title" className="by-hero-title"><span className="by-hero-muted">{words(HERO.muted, 0)}</span>{" "}{words(HERO.rest, HERO.muted.split(" ").length)}</h1>
  <p className="by-hero-sub"><span className="by-sr-only">{HERO.spoken}</span><span aria-hidden="true">We build it for </span><span className="by-hero-roll" aria-hidden="true">{roll.outgoing !== null && <span key={`out-${roll.outgoing}`} className="by-hero-roll-out">{HERO.segments[roll.outgoing]}</span>}<span key={roll.current} onAnimationEnd={() => setRoll(value => ({ current: value.current, outgoing: null }))} className={roll.outgoing === null ? undefined : "by-hero-roll-in"}>{HERO.segments[roll.current]}</span></span></p>
  <HeroScene />
  <div className="by-hero-cta"><Link className="by-action" href="/contact">Book a Strategy Call<span aria-hidden="true">→</span></Link><p className="by-hero-guarantee"><Link href="/solutions">See what you get</Link></p></div>
 </section>;
}

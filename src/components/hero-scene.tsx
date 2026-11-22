"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Homepage hero illustration: the system at work on one buyer at a time. Found, checked, written to,
// replied, booked, then the next buyer. When a call is booked it tells the hero (event below) so the
// gold dot at the end of the hero line pulses.
// Server HTML and reduced motion show the first buyer fully booked. With motion, the loop starts from
// that booked frame, so nothing blanks out on hydration. Hover pauses it so people can read.
// Copy is illustrative (draft for Subham): roles and companies are examples, never clients.
export const HERO_BOOKED_EVENT = "by:hero-booked";

const SCENE = {
 summary: "The system finds a buyer, checks they fit, writes to them, handles the reply and books the call on your calendar.",
 steps: ["Found", "Checked", "Written", "Replied", "Booked"],
 checks: ["Right buyer", "Right market"],
 to: "To",
 replyLabel: "Reply",
 booked: "Intro call",
 onCalendar: "On your calendar",
 buyers: [
  { initials: "HD", role: "Head of Data", org: "Logistics company", signal: "Hiring their first data engineer", opener: "Saw you’re hiring your first data engineer. Want a hand while you look?", reply: "Good timing, actually. Thursday?", day: "Thu", when: "Thursday, 11:00" },
  { initials: "HP", role: "Head of Product", org: "Fintech startup", signal: "A mobile app on this year’s roadmap", opener: "Noticed a mobile app is on your roadmap this year. Who’s building it?", reply: "Still deciding. Can we talk next week?", day: "Tue", when: "Tuesday, 15:30" },
  { initials: "PM", role: "Practice manager", org: "Group of dental clinics", signal: "Just opened a new clinic", opener: "Congrats on the new clinic. Is your IT keeping up with the move?", reply: "Honestly, not really. Call me Monday?", day: "Mon", when: "Monday, 10:00" },
  { initials: "MD", role: "Managing director", org: "Engineering consultancy", signal: "Expanding into a new region", opener: "Saw you’re opening up in a new region. Who’s finding your first clients there?", reply: "That’s the question. Friday works.", day: "Fri", when: "Friday, 14:00" },
 ],
} as const;

// Timeline of one buyer, in ms.
const T = { signal: 650, check1: 1450, check2: 1800, write: 2500, perChar: 24, replyGap: 550, bookGap: 1100, hold: 2700, leave: 480 };
const typingEnd = (n: number) => T.write + n * T.perChar;
const replyAt = (n: number) => typingEnd(n) + T.replyGap;
const bookAt = (n: number) => replyAt(n) + T.bookGap;
const cycle = (n: number) => bookAt(n) + T.hold + T.leave;

type Frame = { buyer: number; step: number; signal: boolean; checks: number; typed: number; leaving: boolean };
const finished = (buyer: number): Frame => ({ buyer, step: 4, signal: true, checks: 2, typed: SCENE.buyers[buyer].opener.length, leaving: false });

function frameAt(buyer: number, t: number): Frame {
 const n = SCENE.buyers[buyer].opener.length;
 return {
  buyer,
  step: t >= bookAt(n) ? 4 : t >= replyAt(n) ? 3 : t >= T.write ? 2 : t >= T.check1 ? 1 : 0,
  signal: t >= T.signal,
  checks: t >= T.check2 ? 2 : t >= T.check1 ? 1 : 0,
  typed: t < T.write ? 0 : Math.min(n, Math.floor((t - T.write) / T.perChar)),
  leaving: t >= bookAt(n) + T.hold,
 };
}
const same = (a: Frame, b: Frame) => a.buyer === b.buyer && a.step === b.step && a.signal === b.signal && a.checks === b.checks && a.typed === b.typed && a.leaving === b.leaving;

export function HeroScene() {
 const root = useRef<HTMLDivElement>(null);
 const [frame, setFrame] = useState<Frame>(() => finished(0));
 // After the first hand-over, each new buyer's card slides in (only on mount, so pausing never replays it).
 const [cycled, setCycled] = useState(false);

 useEffect(() => {
  const el = root.current!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia("(min-width: 1180px)");
  let raf = 0, last = 0, buyer = 0, visible = false, hovered = false, running = false, ready = false, wait = 0;
  // Start inside the booked hold of the first buyer, so the server frame simply carries on.
  let t = bookAt(SCENE.buyers[0].opener.length) + T.hold - 1400;
  let current = finished(0), announced = true;

  const tick = (now: number) => {
   const dt = last ? Math.min(now - last, 64) : 0;
   last = now;
   t += dt;
   const n = SCENE.buyers[buyer].opener.length;
   if (t >= cycle(n)) { t = 0; buyer = (buyer + 1) % SCENE.buyers.length; announced = false; setCycled(true); }
   const next = frameAt(buyer, t);
   if (next.step === 4 && !announced) { announced = true; dispatchEvent(new CustomEvent(HERO_BOOKED_EVENT)); }
   if (!same(next, current)) { current = next; setFrame(next); }
   raf = requestAnimationFrame(tick);
  };
  const sync = () => {
   const go = ready && visible && !hovered && wide.matches && !reduced.matches && document.visibilityState === "visible";
   el.dataset.playing = String(go);
   if (go === running) return;
   running = go;
   if (go) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf);
  };
  const onReduced = () => {
   if (reduced.matches) { buyer = 0; t = bookAt(SCENE.buyers[0].opener.length); current = finished(0); setFrame(current); }
   sync();
  };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  const enter = () => { hovered = true; sync(); };
  const leave = () => { hovered = false; sync(); };
  // Hold still while the first-visit entrance plays and the headline rises (components/home-hero.tsx).
  const begin = (delay: number) => { wait = window.setTimeout(() => { ready = true; sync(); }, delay); };
  let gate: MutationObserver | undefined;
  if (document.querySelector(".by-entrance")) {
   gate = new MutationObserver(() => { if (!document.querySelector(".by-entrance")) { gate?.disconnect(); begin(1500); } });
   gate.observe(document.body, { childList: true, subtree: true });
  } else begin(900);
  io.observe(el);
  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", onReduced);
  wide.addEventListener("change", sync);
  return () => {
   cancelAnimationFrame(raf); io.disconnect(); gate?.disconnect(); clearTimeout(wait);
   el.removeEventListener("pointerenter", enter);
   el.removeEventListener("pointerleave", leave);
   document.removeEventListener("visibilitychange", sync);
   reduced.removeEventListener("change", onReduced);
   wide.removeEventListener("change", sync);
  };
 }, []);

 const b = SCENE.buyers[frame.buyer];
 const typing = frame.step === 2 && frame.typed < b.opener.length;
 return <div ref={root} className="hs" role="img" aria-label={SCENE.summary} data-step={frame.step} data-leaving={frame.leaving} data-playing="false">
  <div className="hs-card" aria-hidden="true">
   <ol className="hs-steps" style={{ "--step": frame.step } as CSSProperties}>
    {SCENE.steps.map((step, k) => <li data-state={k < frame.step ? "done" : k === frame.step ? "now" : "next"} key={step}><i />{step}</li>)}
   </ol>
   <div className="hs-body" data-enter={cycled} key={frame.buyer}>
    <div className="hs-buyer">
     <span className="hs-avatar">{b.initials}</span>
     <span className="hs-who"><b>{b.role}</b><span>{b.org}</span></span>
     <span className="hs-signal" data-on={frame.signal}><i />{b.signal}</span>
    </div>
    <div className="hs-checks">{SCENE.checks.map((check, k) => <span className="hs-check" data-on={frame.checks > k} key={check}><i />{check}</span>)}</div>
    <div className="hs-mail" data-on={frame.step >= 2}>
     <span className="hs-to">{SCENE.to}: {b.role}</span>
     <p className="hs-text"><span>{b.opener.slice(0, frame.typed)}</span>{typing && <i className="hs-caret" />}<span className="hs-ghost">{b.opener.slice(frame.typed)}</span></p>
    </div>
    <div className="hs-reply" data-on={frame.step >= 3}><span className="hs-reply-label">{SCENE.replyLabel}</span><p>{b.reply}</p></div>
    <div className="hs-booked" data-on={frame.step >= 4}>
     <span className="hs-cal"><small>{b.day}</small><i /></span>
     <span className="hs-booked-text"><b>{SCENE.booked}</b><span>{b.when}</span></span>
     <span className="hs-booked-note">{SCENE.onCalendar}</span>
    </div>
   </div>
  </div>
 </div>;
}

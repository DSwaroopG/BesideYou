"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { flight } from "@/content/why-besideyou";
import type { FlightScene } from "@/components/offer-flight-scene";
import { webglAvailable } from "@/lib/webgl";
// Rendered from the 3D scene by scripts/capture-offer-poster.mjs; a static import gives it a
// content-hashed URL, so a regenerated poster is never served from a stale image cache.
import poster from "../../public/offer/poster.webp";

// Pinned 3D flight story for /why-besideyou (prototype pending owner review).
// Server HTML is the static mode: the poster plus every caption, which is also what no-JS and
// reduced-motion visitors get. With motion allowed the section pins (same mechanism as
// how-stages.tsx), captions crossfade with scroll, and three.js loads only when the section is
// near. The canvas fades in over the poster after its first frame; if WebGL is missing or the
// context is lost, the poster simply stays.
const clamp = (value: number) => Math.max(0, Math.min(1, value));


export function OfferFlight() {
 const root = useRef<HTMLElement>(null);

 useEffect(() => {
  const section = root.current!;
  const track = section.querySelector<HTMLElement>(".of-track")!;
  const stage = section.querySelector<HTMLElement>(".of-stage")!;
  const canvas = section.querySelector<HTMLCanvasElement>(".of-canvas")!;
  const beats = Array.from(section.querySelectorAll<HTMLElement>(".of-beat"));
  const starts = flight.beats.map(beat => beat.at);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const small = matchMedia("(max-width: 767px)");
  let pinned = false, near = false, onScreen = false, listening = false, disposed = false;
  let frame = 0, stickyTop = 0, measure = true, synced = false;
  let scene: FlightScene | null = null, loading = false, failed = false;

  // Full-bleed width without the scrollbar (100vw would overflow on platforms with scrollbars).
  const setWidth = () => section.style.setProperty("--of-vw", `${document.documentElement.clientWidth}px`);

  const render = () => {
   frame = 0;
   if (!pinned) { beats.forEach(beat => { beat.dataset.state = "active"; }); return; }
   if (measure) { stickyTop = parseFloat(getComputedStyle(stage).top) || 0; measure = false; }
   const progress = clamp((stickyTop - track.getBoundingClientRect().top) / Math.max(1, track.offsetHeight - stage.clientHeight));
   let active = 0;
   starts.forEach((at, k) => { if (progress >= at) active = k; });
   beats.forEach((beat, k) => { beat.dataset.state = k === active ? "active" : k < active ? "before" : "after"; });
   section.style.setProperty("--of-p", progress.toFixed(4));
   if (scene) { scene.setProgress(progress, !synced); synced = true; }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const listen = () => {
   const should = pinned && near;
   if (should === listening) return;
   listening = should;
   if (should) addEventListener("scroll", schedule, { passive: true }); else removeEventListener("scroll", schedule);
  };

  const drop = () => { scene?.dispose(); scene = null; synced = false; section.dataset.scene = "off"; };
  const fail = () => { failed = true; drop(); };
  const run = () => { if (!scene) return; if (pinned && onScreen && !document.hidden) scene.start(); else scene.stop(); };

  const load = () => {
   if (loading || scene || failed || disposed || !pinned || !near) return;
   if (!webglAvailable()) { failed = true; return; }
   loading = true;
   import("@/components/offer-flight-scene").then(({ createFlightScene }) => {
    loading = false;
    if (disposed || !pinned || scene) return;
    scene = createFlightScene(canvas, { mobile: small.matches, onFirstFrame: () => { section.dataset.scene = "ready"; }, onLost: fail });
    scene.resize(stage.clientWidth, stage.clientHeight);
    synced = false;
    render();
    // Poster capture hook (scripts/capture-offer-poster.mjs), only with ?capture in the URL.
    if (new URLSearchParams(location.search).has("capture")) (window as unknown as { __offerScene?: FlightScene }).__offerScene = scene;
    run();
   }).catch(() => { loading = false; fail(); });
  };

  const setMode = () => {
   pinned = !reduced.matches;
   section.dataset.mode = pinned ? "pinned" : "static";
   if (!pinned) drop();
   measure = true;
   setWidth();
   listen(); schedule(); load(); run();
  };

  const proximity = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; listen(); schedule(); load(); }, { rootMargin: "150% 0px" });
  const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; run(); });
  const resize = new ResizeObserver(() => { measure = true; scene?.resize(stage.clientWidth, stage.clientHeight); schedule(); });
  const onVisibility = () => run();
  proximity.observe(track); visibility.observe(track); resize.observe(stage);
  addEventListener("resize", setWidth);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", setMode);
  setMode();

  return () => {
   disposed = true;
   cancelAnimationFrame(frame);
   removeEventListener("scroll", schedule);
   removeEventListener("resize", setWidth);
   document.removeEventListener("visibilitychange", onVisibility);
   reduced.removeEventListener("change", setMode);
   proximity.disconnect(); visibility.disconnect(); resize.disconnect();
   scene?.dispose(); scene = null;
  };
 }, []);

 return <section ref={root} className="of-flight" aria-labelledby="of-flight-title" data-mode="static" data-scene="off">
  <h2 id="of-flight-title" className="by-sr-only">Circling versus landing</h2>
  <div className="of-track"><div className="of-stage">
   <div className="of-visual">
    {/* Above the fold on load and often the largest paint: load it eagerly (Next 16 guidance). */}
    <Image className="of-poster" src={poster} alt={flight.description} sizes="100vw" loading="eager" fetchPriority="high" />
    <canvas className="of-canvas" aria-hidden="true" />
    <span className="of-veil" aria-hidden="true" />
   </div>
   <div className="of-captions">
    <ol className="of-beats">{flight.beats.map(beat => <li className="of-beat" data-state="active" key={beat.title}>
     <p className="of-beat-title">{beat.title}</p>
     {beat.line && <p className="of-beat-line">{beat.line}</p>}
    </li>)}</ol>
    <p className="of-hint" aria-hidden="true">{flight.hint}<i /></p>
   </div>
  </div></div>
 </section>;
}

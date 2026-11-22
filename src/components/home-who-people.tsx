"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { examples, examplesHead } from "@/content/who-we-work-with";
import { webglAvailable } from "@/lib/webgl";
import type { LineupScene, Tile } from "@/components/who-lineup-scene";
// Posters rendered from this line-up at ease (scripts/capture-home-posters.mjs); they stay for no-JS,
// reduced motion and no WebGL. Static imports give hashed URLs.
import aiPoster from "../../public/who/home-ai-and-data.webp";
import studioPoster from "../../public/who/home-software-studios.webp";
import itPoster from "../../public/who/home-managed-it.webp";
import servicePoster from "../../public/who/home-b2b-service.webp";

const POSTERS = { "ai-and-data": aiPoster, "software-studios": studioPoster, "managed-it": itPoster, "b2b-service": servicePoster } as const;
const SPEAK = 3600;      // ms each person talks
const PAUSE = 500;       // ms between speakers
const FIRST_TURN = 3000; // ms after the walk-in starts (person 01 has waved by then)

// The homepage "Who benefits" line-up. Server HTML is the four poster tiles (final look). After
// hydration, with motion allowed: the tiles reveal when the section scrolls in, a live 3D line-up
// (who-lineup-scene.ts, loaded lazily near the section) replaces the posters, each person walks
// in and waves, and they take turns saying their growth problem in a speech bubble (hover or focus
// a tile to hear that person). Without WebGL the posters stay and the bubbles still take turns.
export function HomeWhoPeople() {
 const root = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const box = root.current!;
  const canvas = box.querySelector<HTMLCanvasElement>(".hm-lineup-canvas")!;
  const items = Array.from(box.querySelectorAll<HTMLElement>(".hm-person"));
  const portraits = items.map(item => item.querySelector<HTMLElement>(".hm-portrait")!);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  let scene: LineupScene | null = null, loading = false, failed = false, disposed = false;
  let entered = false, onScreen = false, hovered = -1, speaker = -1, next = 0, timer = 0;

  // ---------- Speaking turns ----------
  const speak = (index: number) => {
   speaker = index;
   items.forEach((item, k) => { item.dataset.speaking = String(k === index); });
   scene?.setSpeaker(index);
  };
  const clear = () => { window.clearTimeout(timer); timer = 0; };
  const turn = () => {
   clear();
   if (!entered || !onScreen || hovered >= 0) return;
   speak(next);
   timer = window.setTimeout(() => { speak(-1); next = (next + 1) % items.length; timer = window.setTimeout(turn, PAUSE); }, SPEAK);
  };

  // ---------- The 3D line-up ----------
  const offset = (el: HTMLElement) => {
   let x = 0, y = 0;
   for (let node: HTMLElement | null = el; node && node !== box; node = node.offsetParent as HTMLElement | null) { x += node.offsetLeft; y += node.offsetTop; }
   return { x, y };
  };
  const layout = () => {
   if (!scene) return;
   const tiles: Tile[] = portraits.map(portrait => {
    const { x, y } = offset(portrait);
    return { x: x + 1, y: y + 1, w: portrait.offsetWidth - 2, h: portrait.offsetHeight - 2 };
   });
   scene.setLayout(tiles, box.clientWidth, box.clientHeight);
  };
  const run = () => { if (!scene) return; if (onScreen && !document.hidden) scene.start(); else scene.stop(); };
  const fail = () => { failed = true; scene?.dispose(); scene = null; box.dataset.scene = "off"; };
  const load = () => {
   if (loading || scene || failed || disposed) return;
   if (!webglAvailable()) { failed = true; return; }
   loading = true;
   import("@/components/who-lineup-scene").then(({ createLineupScene }) => {
    loading = false;
    if (disposed || scene) return;
    scene = createLineupScene(canvas, { mobile: matchMedia("(max-width: 767px), (pointer: coarse)").matches, onFirstFrame: () => { box.dataset.scene = "ready"; }, onLost: fail });
    layout();
    // Already on stage (the section came into view before the scene loaded): no walk-in.
    if (entered) scene.enter(true);
    scene.setSpeaker(speaker);
    // Poster capture hook (scripts/capture-home-posters.mjs), only with ?capture in the URL.
    if (new URLSearchParams(location.search).has("capture")) (window as unknown as { __lineupScene?: LineupScene }).__lineupScene = scene;
    run();
   }).catch(() => { loading = false; fail(); });
  };

  // ---------- Observers ----------
  const fold = innerHeight * .92;
  if (box.getBoundingClientRect().top > fold) box.dataset.state = "armed";
  const near = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) load(); }, { rootMargin: "150% 0px" });
  const stage = new IntersectionObserver(([entry]) => {
   if (!entry.isIntersecting || entered) return;
   entered = true;
   box.dataset.state = "in";
   scene?.enter(false);
   timer = window.setTimeout(turn, FIRST_TURN);
  }, { threshold: .3 });
  const visible = new IntersectionObserver(([entry]) => {
   onScreen = entry.isIntersecting;
   run();
   if (!onScreen) { clear(); if (speaker >= 0) { speak(-1); next = (next + 1) % items.length; } }
   else if (entered && !timer && hovered < 0) timer = window.setTimeout(turn, 900);
  });
  const resize = new ResizeObserver(layout);
  near.observe(box); stage.observe(box); visible.observe(box); resize.observe(box);

  // Hover or focus a tile: that person speaks until the pointer or focus leaves.
  const enter = (k: number) => () => { hovered = k; clear(); if (entered) speak(k); };
  const leave = (k: number) => () => {
   if (hovered !== k) return;
   hovered = -1;
   speak(-1);
   next = (k + 1) % items.length;
   clear();
   timer = window.setTimeout(turn, 1200);
  };
  const handlers = items.map((item, k) => {
   const on = enter(k), off = leave(k);
   item.addEventListener("pointerenter", on); item.addEventListener("pointerleave", off);
   item.addEventListener("focusin", on); item.addEventListener("focusout", off);
   return () => { item.removeEventListener("pointerenter", on); item.removeEventListener("pointerleave", off); item.removeEventListener("focusin", on); item.removeEventListener("focusout", off); };
  });
  const onVisibility = () => run();
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
   disposed = true;
   clear();
   near.disconnect(); stage.disconnect(); visible.disconnect(); resize.disconnect();
   handlers.forEach(off => off());
   document.removeEventListener("visibilitychange", onVisibility);
   scene?.dispose(); scene = null;
   delete box.dataset.state; box.dataset.scene = "off";
   items.forEach(item => { item.dataset.speaking = "false"; });
  };
 }, []);

 return <div ref={root} className="hm-lineup" data-scene="off">
  <ul className="hm-people">{examples.map((example, k) => <li className="hm-person" data-speaking="false" style={{ "--k": k } as CSSProperties} key={example.id}>
   <Link href={`/who-we-help#${example.id}`}>
    <span className="hm-portrait"><Image src={POSTERS[example.id]} alt="" sizes="(max-width: 767px) 45vw, 22vw" /></span>
    <span className="hm-num"><span>{String(k + 1).padStart(2, "0")}</span> · {example.name}</span>
    <span className="hm-lines">
     <span className="hm-said">“{example.speech[0]}”</span>
     <span className="hm-bubble" aria-hidden="true"><span className="hm-bubble-label">{examplesHead.speechLabels[1]}</span>{example.speech[1]}</span>
    </span>
   </Link>
  </li>)}</ul>
  <canvas className="hm-lineup-canvas" aria-hidden="true" />
 </div>;
}

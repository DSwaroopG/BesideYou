"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { examples, examplesHead } from "@/content/who-we-work-with";
import { PEOPLE, STORY, storyAt } from "@/components/who-story";
import { webglAvailable } from "@/lib/webgl";
import type { PeopleScene } from "@/components/who-people-scene";
// Posters are rendered from the 3D scene by scripts/capture-who-posters.mjs. Static imports give
// them content-hashed URLs, so a regenerated poster is never served from a stale image cache.
import aiPoster from "../../public/who/ai-and-data.webp";
import studioPoster from "../../public/who/software-studios.webp";
import itPoster from "../../public/who/managed-it.webp";
import servicePoster from "../../public/who/b2b-service.webp";

const POSTERS = { "ai-and-data": aiPoster, "software-studios": studioPoster, "managed-it": itPoster, "b2b-service": servicePoster } as const;

// Examples on /who-we-help as a pinned scroll story: four people (one per example), each
// walking in and explaining their card row by row in a speech bubble. Same mechanics as
// how-stages.tsx and offer-flight.tsx: server HTML is the static mode (every person, card and line
// stacked; also used for no-JS, reduced motion and short screens). With motion allowed the section
// pins, scroll drives the chapter, the active card row and the speech line, and the three.js scene
// loads lazily when near; its canvas fades in over each person's poster after the first frame.
// Ids double as deep links (/who-we-help#managed-it), including footer links on this page.
const PIN_QUERY = "(min-height: 640px)";
// How long (in chapter progress) each card row takes to fill once its explanation starts.
const ROW_FILL = [.13, .14, .15, .13] as const;
const DOT_WINDOW = .05;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value < .5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
const indexOf = (hash: string) => examples.findIndex(example => `#${example.id}` === hash);

export function WhoExamples() {
 const root = useRef<HTMLElement>(null);

 useEffect(() => {
  const section = root.current!;
  const track = section.querySelector<HTMLElement>(".ww-track")!;
  const stage = section.querySelector<HTMLElement>(".ww-stage")!;
  const canvas = section.querySelector<HTMLCanvasElement>(".ww-canvas")!;
  const rail = section.querySelector<HTMLElement>(".ww-rail")!;
  const dot = section.querySelector<HTMLElement>(".ww-rail-dot")!;
  const stops = Array.from(section.querySelectorAll<HTMLElement>(".ww-stop"));
  const chapters = Array.from(section.querySelectorAll<HTMLElement>(".ww-chapter"));
  const rows = chapters.map(chapter => Array.from(chapter.querySelectorAll<HTMLElement>(".ww-row")));
  const lines = chapters.map(chapter => Array.from(chapter.querySelectorAll<HTMLElement>(".ww-line")));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const tall = matchMedia(PIN_QUERY);
  const small = matchMedia("(max-width: 767px)");
  let pinned = false, near = false, onScreen = false, listening = false, disposed = false;
  let frame = 0, stickyTop = 0, railWidth = 0, measure = true, synced = false, aimedAt = -1;
  let scene: PeopleScene | null = null, loading = false, failed = false;

  // Where the hand should aim for each row of a chapter's card, in canvas pixels.
  const targetsFor = (chapter: number): Array<[number, number]> => {
   const box = canvas.getBoundingClientRect();
   const card = chapters[chapter].querySelector<HTMLElement>(".ww-card")!.getBoundingClientRect();
   return rows[chapter].map(row => {
    const r = row.getBoundingClientRect();
    // Phones: the card sits below the person, so aim into the row for a clear diagonal point.
    const x = small.matches ? r.left + r.width * .55 : card.left - 4;
    return [x - box.left, r.top + r.height / 2 - box.top];
   });
  };

  // The card fills in as it is explained: each row's fill runs 0..1 over part of its slot.
  const cards = chapters.map(chapter => ({
   card: chapter.querySelector<HTMLElement>(".ww-card")!,
   chips: Array.from(chapter.querySelectorAll<HTMLElement>(".ww-chip")),
   mark: chapter.querySelector<HTMLElement>(".ww-mark")!,
   words: chapter.querySelectorAll(".ww-w").length,
   type: chapter.querySelector<HTMLElement>(".ww-type")!,
   chars: chapter.querySelectorAll(".ww-ch").length,
   signals: Array.from(chapter.querySelectorAll<HTMLElement>(".ww-sigs li")),
   stamp: chapter.querySelector<HTMLElement>(".ww-stamp")!,
  }));
  const fillCard = (chapter: number, local: number, allDone: boolean) => {
   const c = cards[chapter];
   const fill = STORY.rows.map((start, r) => allDone ? 1 : clamp((local - start) / ROW_FILL[r]));
   c.chips.forEach((chip, i) => { chip.dataset.on = String(fill[0] > (i + .4) / (c.chips.length + .4)); });
   c.mark.style.setProperty("--n", String(Math.ceil(clamp(fill[1] / .6) * c.words)));
   c.mark.style.setProperty("--rp", fill[1] >= 1 ? "1" : clamp((fill[1] - .5) * 2).toFixed(3));
   c.type.style.setProperty("--n", String(Math.floor(fill[2] * c.chars)));
   c.type.style.setProperty("--caret", fill[2] > 0 && fill[2] < 1 ? "1" : "0");
   c.signals.forEach((signal, j) => { signal.dataset.checked = String(fill[3] > (j + 1) / 5.5); });
   c.stamp.dataset.on = String(fill[3] >= 1);
   c.card.style.setProperty("--done", String(fill.filter(value => value >= 1).length));
  };
  const resetCards = () => cards.forEach(c => {
   c.chips.forEach(chip => { chip.dataset.on = "true"; });
   c.signals.forEach(signal => { signal.dataset.checked = "true"; });
   c.stamp.dataset.on = "true";
   for (const [el, names] of [[c.mark, ["--n", "--rp"]], [c.type, ["--n", "--caret"]], [c.card, ["--done"]]] as const) names.forEach(name => el.style.removeProperty(name));
  });

  const showAll = () => {
   resetCards();
   chapters.forEach(chapter => { chapter.dataset.state = "active"; chapter.dataset.talking = "true"; });
   rows.flat().forEach(row => { row.dataset.state = "done"; });
   lines.flat().forEach(line => { line.dataset.state = "on"; });
   stops.forEach(stop => { stop.dataset.state = "reached"; });
  };

  const render = () => {
   frame = 0;
   if (!pinned) { showAll(); return; }
   if (measure) { stickyTop = parseFloat(getComputedStyle(stage).top) || 0; railWidth = rail.clientWidth; measure = false; aimedAt = -1; }
   const progress = clamp((stickyTop - track.getBoundingClientRect().top) / Math.max(1, track.offsetHeight - stage.clientHeight));
   const story = storyAt(progress);
   chapters.forEach((chapter, k) => { chapter.dataset.state = k === story.chapter ? "active" : k < story.chapter ? "before" : "after"; });
   rows[story.chapter].forEach((row, r) => { row.dataset.state = story.allDone || r < story.row ? "done" : r === story.row ? "active" : "next"; });
   lines[story.chapter].forEach((line, j) => { line.dataset.state = j === story.line ? "on" : "off"; });
   fillCard(story.chapter, story.local, story.allDone);
   chapters[story.chapter].dataset.talking = String(story.line >= 0);
   let pos = 0;
   for (let k = 1; k < PEOPLE; k++) pos += ease(clamp((progress - k / PEOPLE + DOT_WINDOW) / DOT_WINDOW));
   dot.style.transform = `translateX(${(pos / (PEOPLE - 1) * railWidth).toFixed(1)}px)`;
   rail.style.setProperty("--pos", (pos / (PEOPLE - 1)).toFixed(4));
   stops.forEach((stop, k) => { stop.dataset.state = k === story.chapter ? "active" : k < story.chapter ? "reached" : "pending"; });
   section.style.setProperty("--ww-p", progress.toFixed(4));
   if (scene) {
    if (aimedAt !== story.chapter) { scene.setTargets(targetsFor(story.chapter)); aimedAt = story.chapter; }
    scene.setProgress(progress, !synced);
    synced = true;
   }
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
  const sizeScene = () => { if (!scene) return; scene.resize(canvas.clientWidth, canvas.clientHeight); aimedAt = -1; };

  const load = () => {
   if (loading || scene || failed || disposed || !pinned || !near) return;
   if (!webglAvailable()) { failed = true; return; }
   loading = true;
   import("@/components/who-people-scene").then(({ createPeopleScene }) => {
    loading = false;
    if (disposed || !pinned || scene) return;
    scene = createPeopleScene(canvas, { mobile: small.matches, onFirstFrame: () => { section.dataset.scene = "ready"; }, onLost: fail });
    sizeScene();
    synced = false;
    render();
    // Poster capture hook (scripts/capture-who-posters.mjs), only with ?capture in the URL.
    if (new URLSearchParams(location.search).has("capture")) (window as unknown as { __whoScene?: PeopleScene }).__whoScene = scene;
    run();
   }).catch(() => { loading = false; fail(); });
  };

  // Deep links land on a person's introduction, in either mode.
  const goTo = (index: number) => {
   if (index < 0) return;
   if (!pinned) { chapters[index].scrollIntoView(); return; }
   const top = track.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
   scrollTo({ top: top + (index + .2) / PEOPLE * (track.offsetHeight - stage.clientHeight), behavior: "instant" });
  };
  const fromHash = () => goTo(indexOf(location.hash));
  // Same-page links (the footer) would otherwise make the router jump to the pinned stage itself.
  const fromClick = (event: MouseEvent) => {
   const link = (event.target as Element | null)?.closest?.("a[href*='#']");
   if (!(link instanceof HTMLAnchorElement)) return;
   const url = new URL(link.href);
   const index = indexOf(url.hash);
   if (url.pathname !== location.pathname || index < 0) return;
   event.preventDefault();
   history.pushState(null, "", url.hash);
   goTo(index);
  };

  const setMode = () => {
   pinned = !reduced.matches && tall.matches;
   section.dataset.mode = pinned ? "pinned" : "static";
   if (!pinned) drop();
   measure = true;
   listen(); schedule(); load(); run();
  };

  const proximity = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; listen(); schedule(); load(); }, { rootMargin: "150% 0px" });
  const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; run(); });
  const resize = new ResizeObserver(() => { measure = true; sizeScene(); schedule(); });
  const onVisibility = () => run();
  proximity.observe(track); visibility.observe(track); resize.observe(stage); resize.observe(canvas);
  addEventListener("hashchange", fromHash);
  document.addEventListener("click", fromClick, true);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", setMode);
  tall.addEventListener("change", setMode);
  setMode();
  if (location.hash) requestAnimationFrame(fromHash);

  return () => {
   disposed = true;
   cancelAnimationFrame(frame);
   removeEventListener("scroll", schedule);
   removeEventListener("hashchange", fromHash);
   document.removeEventListener("click", fromClick, true);
   document.removeEventListener("visibilitychange", onVisibility);
   reduced.removeEventListener("change", setMode);
   tall.removeEventListener("change", setMode);
   proximity.disconnect(); visibility.disconnect(); resize.disconnect();
   scene?.dispose(); scene = null;
  };
 }, []);

 return <section ref={root} className="by-section ww-examples" aria-labelledby="ww-examples-title" data-mode="static" data-scene="off">
  <div className="by-grid ww-examples-head">
   <div className="by-span5 ww-rv ww-rise"><p className="by-eyebrow">{examplesHead.eyebrow}</p><h2 id="ww-examples-title">{examplesHead.title}</h2></div>
   <p className="by-span7 by-lead ww-rv ww-rise">{examplesHead.more}</p>
  </div>
  <p className="by-sr-only">{examplesHead.people}</p>

  <div className="ww-track"><div className="ww-stage">
   <div className="ww-rail" aria-hidden="true">
    <span className="ww-rail-line"><i /></span>
    <span className="ww-rail-dot" />
    <ol className="ww-stops">{examples.map((example, k) => <li className="ww-stop" data-state="reached" style={{ "--k": k } as CSSProperties} key={example.id}>
     <span className="ww-stop-mark" /><span className="ww-stop-label"><span className="ww-stop-num">{String(k + 1).padStart(2, "0")}</span>{example.name}</span>
    </li>)}</ol>
   </div>

   <div className="ww-body">
    <ol className="ww-chapters">
     {examples.map((example, k) => <li className="ww-chapter by-grid" id={example.id} data-state="active" key={example.id}>
      <div className="by-span5 ww-person">
       <Image className="ww-poster" src={POSTERS[example.id]} alt="" sizes="(max-width: 767px) 60vw, 34vw" />
       <div className="ww-bubble">
        <h3 className="ww-name"><span className="ww-name-num" aria-hidden="true">{String(k + 1).padStart(2, "0")}</span>{example.name}</h3>
        <ol className="ww-lines">{example.speech.map((line, j) => <li className="ww-line" data-state="on" key={j}><span className="ww-line-label">{examplesHead.speechLabels[j]}</span>{line}</li>)}</ol>
       </div>
      </div>
      <div className="by-span7 ww-card-wrap">
       <div className="ww-card">
        <p className="ww-card-head"><span className="ww-meter" aria-hidden="true">{[0, 1, 2, 3].map(i => <i key={i} style={{ "--i": i } as CSSProperties} />)}</span></p>
        <dl className="ww-card-rows">
         <div className="ww-row" data-state="done"><dt>{examplesHead.labels.buyer}</dt><dd><span className="ww-chips">{example.buyer.split(" · ").map((title, i, all) => <span className="ww-chip" data-on="true" key={title}>{title}{i < all.length - 1 && <span className="by-sr-only">, </span>}</span>)}</span></dd></div>
         <div className="ww-row" data-state="done"><dt>{examplesHead.labels.market}</dt><dd><span className="ww-mark">{example.market.split(" ").map((word, i, all) => <span className="ww-w" style={{ "--i": i } as CSSProperties} key={i}>{word}{i < all.length - 1 ? " " : ""}</span>)}</span></dd></div>
         <div className="ww-row ww-row-line" data-state="done"><dt>{examplesHead.labels.line}</dt><dd><span className="ww-quote"><span className="by-sr-only">{example.line}</span><span className="ww-type" aria-hidden="true">{Array.from(example.line).map((char, i) => <span className="ww-ch" style={{ "--i": i } as CSSProperties} key={i}>{char}</span>)}</span></span></dd></div>
         <div className="ww-row" data-state="done"><dt>{examplesHead.labels.call}</dt><dd><ul className="ww-sigs">{examplesHead.signals.map((signal, j) => {
          const lit = (example.lit as readonly string[]).includes(signal);
          return <li key={signal} data-lit={lit} data-checked="true"><i className="ww-sig" aria-hidden="true" />{signal}<span className="by-sr-only">{lit ? ", present" : ", not present"}</span></li>;
         })}</ul></dd></div>
        </dl>
        <span className="ww-stamp" data-on="true" aria-hidden="true">{examplesHead.stamp}</span>
       </div>
      </div>
     </li>)}
    </ol>
    <div className="ww-canvas-box" aria-hidden="true"><canvas className="ww-canvas" /></div>
   </div>

   <div className="ww-stage-foot" aria-hidden="true"><span className="ww-hint">{examplesHead.hint}<i /></span></div>
  </div></div>
 </section>;
}

"use client";

import { useEffect, useRef } from "react";

const DIFFERENCE = {
 status: {
  title: "The status quo",
  word: "by luck",
  sends: [1, 2, 3, 4, 5, 6, 20, 21, 22, 40, 41, 50],
  replies: [22, 51],
  golds: [53],
 },
 besideYou: {
  title: "BesideYou",
  word: "on schedule",
  sends: Array.from({ length: 30 }, (_, index) => index * 2 + 1),
  replies: [12, 22, 32, 44, 54],
  golds: [19, 39, 58],
  rebuilt: [1, 21, 41],
 },
 rows: [
  ["Sending", "You send when you have time.", "It sends whether you have time or not.", 8],
  ["Follow up", "Nobody owns the follow up.", "Every reply is read within two hours.", 22],
  ["The list", "The list goes stale.", "The list is rebuilt each cycle.", 41],
  ["Results", "Results arrive by luck.", "Results arrive on a schedule.", 58],
 ],
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeInOutCubic = (value: number) => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const xForDay = (day: number) => `${(day - 1) / 59 * 100}%`;

export function HomeDifference() {
 const root = useRef<HTMLElement>(null);
 const motion = useRef({ progress: -1, day: 60, stuck: false, dirty: true });

 useEffect(() => {
  const section = root.current!;
  const track = section.querySelector<HTMLElement>(".by-diff-track")!;
  const stage = section.querySelector<HTMLElement>(".by-diff-stage")!;
  const digits = Array.from(section.querySelectorAll<HTMLElement>(".by-diff-digit-column"));
  const bar = section.querySelector<HTMLElement>(".by-diff-progress i")!;
  const playheads = Array.from(section.querySelectorAll<SVGLineElement>(".by-diff-playhead"));
  const marks = Array.from(section.querySelectorAll<SVGElement>(".by-diff-mark"));
  const scoreNumbers = Array.from(section.querySelectorAll<HTMLElement>(".by-diff-score-number"));
  const scoreUnits = Array.from(section.querySelectorAll<HTMLElement>(".by-diff-score-unit"));
  const scoreReaders = Array.from(section.querySelectorAll<HTMLElement>(".by-diff-score-reader"));
  const rows = Array.from(section.querySelectorAll<HTMLElement>(".by-diff-row[data-moment]"));
  const hint = section.querySelector<HTMLElement>(".by-diff-hint")!;
  const finale = section.querySelector<HTMLElement>(".by-diff-finale")!;
  const destination = section.querySelector<HTMLElement>(".by-diff-destination")!;
  const laneGolds = Array.from(section.querySelectorAll<SVGCircleElement>('[data-lane="by"] .by-diff-gold'));
  const mergedGolds = Array.from(section.querySelectorAll<SVGCircleElement>(".by-diff-merge circle"));
  const wide = matchMedia("(min-width: 768px)");
  const tall = matchMedia("(min-height: 720px)");
  const motionOk = matchMedia("(prefers-reduced-motion: no-preference)");
  const m = motion.current;
  let frame = 0, pinned = false, near = false, listening = false;

  const score = (index: number, value: number, animate: boolean) => {
   const unit = value === 1 ? "qualified conversation" : "qualified conversations";
   const word = index === 0 ? DIFFERENCE.status.word : DIFFERENCE.besideYou.word;
   if (scoreNumbers[index].textContent === String(value)) return;
   scoreNumbers[index].textContent = String(value);
   scoreUnits[index].textContent = unit;
   scoreReaders[index].textContent = `${value} ${unit}, ${word}`;
   if (animate) scoreNumbers[index].animate(
    [{ transform: "scale(1.25)" }, { transform: "scale(1)" }],
    { duration: 320, easing: "ease-out" },
   );
  };

  const finalState = () => {
   digits[0].style.transform = "translateY(-6em)";
   digits[1].style.transform = "translateY(0)";
   bar.style.transform = "scaleX(1)";
   playheads.forEach(playhead => { playhead.style.opacity = "0"; });
   marks.forEach(mark => { mark.style.removeProperty("opacity"); });
   score(0, 1, false); score(1, 3, false);
   rows.forEach(row => { row.dataset.lit = "true"; });
   hint.style.opacity = "0"; finale.style.opacity = "1";
   laneGolds.forEach(gold => { gold.style.visibility = "visible"; });
   mergedGolds.forEach(gold => { gold.style.opacity = "0"; });
   m.day = 60;
  };

  const applyProgress = (progress: number, stuck: boolean) => {
   const t = clamp(progress / .86);
   const day = 1 + t * 59;
   const shownDay = String(Math.max(1, Math.round(day))).padStart(2, "0");
   const forward = m.progress >= 0 && progress > m.progress;
   const previousDay = m.day;
   digits.forEach((digit, index) => { digit.style.transform = `translateY(-${shownDay[index]}em)`; });
   bar.style.transform = `scaleX(${t})`;
   const x = xForDay(day);
   playheads.forEach(playhead => {
    playhead.setAttribute("x1", x); playhead.setAttribute("x2", x);
    playhead.style.opacity = t > 0 && t < 1 ? "1" : "0";
   });
   marks.forEach(mark => {
    const revealAt = Number(mark.dataset.day);
    const shown = day >= revealAt;
    mark.style.opacity = shown ? "1" : "0";
    if (shown && previousDay < revealAt && forward && mark.matches(".by-diff-reply,.by-diff-gold")) {
     mark.animate(
      [{ transform: "scale(.3)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
      { duration: 380, easing: "ease-out" },
     );
    }
   });
   const scores = [
    DIFFERENCE.status.golds.filter(markDay => day >= markDay).length,
    DIFFERENCE.besideYou.golds.filter(markDay => day >= markDay).length,
   ];
   scores.forEach((value, index) => score(index, value, forward));
   rows.forEach(row => { row.dataset.lit = String(day >= Number(row.dataset.moment)); });
   hint.style.opacity = stuck && progress < .015 ? "1" : "0";

   const f = clamp((progress - .88) / .12);
   const eased = easeInOutCubic(f);
   finale.style.opacity = f > .6 ? "1" : "0";
   laneGolds.forEach(gold => { gold.style.visibility = f > 0 ? "hidden" : "visible"; });
   mergedGolds.forEach((gold, index) => {
    if (f <= 0) { gold.style.opacity = "0"; return; }
    const stageRect = stage.getBoundingClientRect();
    const source = laneGolds[index].getBoundingClientRect();
    const destinationRect = destination.getBoundingClientRect();
    const startX = source.left + source.width / 2 - stageRect.left;
    const startY = source.top + source.height / 2 - stageRect.top;
    const endX = destinationRect.left + destinationRect.width / 2 - stageRect.left;
    const endY = destinationRect.top + destinationRect.height / 2 - stageRect.top;
    gold.setAttribute("cx", String(startX + (endX - startX) * eased));
    gold.setAttribute("cy", String(startY + (endY - startY) * eased));
    gold.setAttribute("r", String(6.5 + 3 * eased));
    gold.style.opacity = String(1 - clamp((f - .8) / .2));
   });
   m.day = day;
  };

  const render = () => {
   frame = 0;
   if (!pinned) { finalState(); m.progress = -1; m.dirty = false; return; }
   const stageHeight = stage.clientHeight;
   const rect = track.getBoundingClientRect();
   const progress = clamp(-rect.top / Math.max(1, track.offsetHeight - stageHeight));
   const stuck = rect.top <= 89;
   if (!m.dirty && Math.abs(progress - m.progress) <= .0001 && stuck === m.stuck) return;
   applyProgress(progress, stuck);
   m.progress = progress; m.stuck = stuck; m.dirty = false;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const scroll = () => { schedule(); };
  const listen = () => {
   const should = pinned && near;
   if (should === listening) return;
   listening = should;
   if (listening) { addEventListener("scroll", scroll, { passive: true }); schedule(); }
   else removeEventListener("scroll", scroll);
  };
  const setMode = () => {
   pinned = wide.matches && tall.matches && motionOk.matches;
   section.dataset.mode = pinned ? "pinned" : "static";
   m.progress = -1; m.stuck = false; m.dirty = true;
   listen(); schedule();
  };
  const resize = () => { m.dirty = true; schedule(); };
  const proximity = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; listen(); }, { rootMargin: "100% 0px" });
  proximity.observe(track);
  addEventListener("resize", resize);
  wide.addEventListener("change", setMode); tall.addEventListener("change", setMode); motionOk.addEventListener("change", setMode);
  setMode();
  return () => {
   cancelAnimationFrame(frame); removeEventListener("scroll", scroll); removeEventListener("resize", resize);
   proximity.disconnect();
   wide.removeEventListener("change", setMode); tall.removeEventListener("change", setMode); motionOk.removeEventListener("change", setMode);
  };
 }, []);

 return <section ref={root} className="by-section by-diff" aria-labelledby="diff-title" data-mode="static">
  <div className="by-diff-track"><div className="by-diff-stage">
   <div className="by-diff-head"><div><p className="by-eyebrow">The difference</p><h2 id="diff-title">Same sixty days. Very different results.</h2></div><DayCounter /></div>
   <div className="by-diff-progress" aria-hidden="true"><i /></div>
   <Lane lane="quo" title={DIFFERENCE.status.title} word={DIFFERENCE.status.word} sends={DIFFERENCE.status.sends} replies={DIFFERENCE.status.replies} golds={DIFFERENCE.status.golds} />
   <Lane lane="by" title={DIFFERENCE.besideYou.title} word={DIFFERENCE.besideYou.word} sends={DIFFERENCE.besideYou.sends} replies={DIFFERENCE.besideYou.replies} golds={DIFFERENCE.besideYou.golds} rebuilt={DIFFERENCE.besideYou.rebuilt} />
   <ul className="by-diff-legend" aria-hidden="true"><li><i data-icon="send" />Email sent</li><li><i data-icon="reply" />Reply</li><li><i data-icon="gold" />Qualified conversation</li></ul>
   <div className="by-diff-compare"><div className="by-diff-compare-head"><span /><span>The status quo</span><span>BesideYou</span></div>{DIFFERENCE.rows.map(([label, status, owned, moment]) => <div className="by-diff-row" data-moment={moment} data-lit="true" key={label}><span className="by-diff-row-label">{label}</span><span>{status}</span><span>{owned}</span></div>)}</div>
   <div className="by-diff-foot"><p className="by-diff-hint" aria-hidden="true">Scroll to run the sixty days<i /></p><p className="by-diff-finale"><i className="by-diff-destination" aria-hidden="true" /><span>Three conversations, on schedule.</span><a href="#flow-title">Here is how.</a></p><span className="by-diff-note">Illustrative, not client data</span></div>
   <svg className="by-diff-merge" aria-hidden="true" focusable="false"><circle /><circle /><circle /></svg>
  </div></div>
 </section>;
}

function DayCounter() {
 return <div className="by-diff-day" aria-hidden="true"><span className="by-diff-day-label">day</span><span className="by-diff-digits">{[6, 0].map((value, column) => <span className="by-diff-digit-column" style={{ transform: `translateY(-${value}em)` }} key={column}>{Array.from({ length: 10 }, (_, digit) => <span key={digit}>{digit}</span>)}</span>)}</span></div>;
}

function Lane({ lane, title, word, sends, replies, golds, rebuilt = [] }: { lane: "quo" | "by"; title: string; word: string; sends: readonly number[]; replies: readonly number[]; golds: readonly number[]; rebuilt?: readonly number[] }) {
 return <div className="by-diff-lane" data-lane={lane}><div className="by-diff-chart"><h3>{title}</h3><span className="by-sr-only by-diff-score-reader">{golds.length} {golds.length === 1 ? "qualified conversation" : "qualified conversations"}, {word}</span><svg aria-hidden="true" focusable="false">
  <line className="by-diff-baseline" x1="0%" x2="100%" y1="60" y2="60" />
  {sends.map(day => <line className="by-diff-mark by-diff-send" data-day={day} x1={xForDay(day)} x2={xForDay(day)} y1={60 - (lane === "quo" ? 20 * (.55 + .45 * (1 - day / 60 * .7)) : 18)} y2="60" strokeOpacity={lane === "quo" ? Math.max(.3, 1 - day / 60 * .7) : 1} key={`send-${day}`} />)}
  {replies.map(day => <g key={`reply-${day}`}><circle className="by-diff-mark by-diff-reply" data-day={day} cx={xForDay(day)} cy="30" r="4.5" />{lane === "by" && <line className="by-diff-mark by-diff-quick" data-day={day + .6} x1={xForDay(day)} x2={xForDay(day)} y1="36" y2="23" transform="translate(8 0)" />}</g>)}
  {rebuilt.map(day => <g className="by-diff-mark by-diff-rebuilt" data-day={day} key={`rebuilt-${day}`}><line x1={xForDay(day)} x2={xForDay(day)} y1="14" y2="60" transform="translate(1 0)" /><text x={xForDay(day)} y="20" transform="translate(5 0)">list rebuilt</text></g>)}
  {golds.map(day => <circle className="by-diff-mark by-diff-gold" data-day={day} cx={xForDay(day)} cy="12" r="6.5" key={`gold-${day}`} />)}
  <line className="by-diff-playhead" x1="100%" x2="100%" y1="6" y2="64" />
  <text className="by-diff-axis" x="0%" y="80">Day 1</text><text className="by-diff-axis" x="50%" y="80" textAnchor="middle">Day 30</text><text className="by-diff-axis" x="100%" y="80" textAnchor="end">Day 60</text>
 </svg></div><div className="by-diff-score" aria-hidden="true"><strong className="by-diff-score-number">{golds.length}</strong><span className="by-diff-score-unit">{golds.length === 1 ? "qualified conversation" : "qualified conversations"}</span><span className="by-diff-score-word">{word}</span></div></div>;
}

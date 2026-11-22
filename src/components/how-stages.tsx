"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { stages, stagesHead, vignettes } from "@/content/how-it-works";

// Pinned scroll story for /how-it-works. Scroll mechanics follow home-flow.tsx:
// the section renders static (all stages stacked, every detail drawn) and is upgraded to a
// pinned stage only on roomy screens with motion allowed. Reveal targets carry data-at, a
// threshold on their stage's local progress; CSS decides how a pending element looks.
const PIN_QUERY = "(min-width: 900px) and (min-height: 700px)";
const DOT_WINDOW = .07;   // share of the track over which the rail dot travels to the next stop
const REVEAL_SPAN = .7;   // share of a stage's window used for its vignette reveal
const LEAD_IN = .12;      // stage 01 starts revealing slightly before the stage pins

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value < .5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;

export function HowStages() {
 const root = useRef<HTMLElement>(null);

 useEffect(() => {
  const section = root.current!;
  const track = section.querySelector<HTMLElement>(".hw-track")!;
  const stage = section.querySelector<HTMLElement>(".hw-stage")!;
  const rail = section.querySelector<HTMLElement>(".hw-rail")!;
  const dot = section.querySelector<HTMLElement>(".hw-rail-dot")!;
  const stops = Array.from(section.querySelectorAll<HTMLElement>(".hw-stop"));
  const chapters = Array.from(section.querySelectorAll<HTMLElement>(".hw-chapter"));
  const reveals = chapters.map(chapter => Array.from(chapter.querySelectorAll<HTMLElement>("[data-at]")).map(el => [el, Number(el.dataset.at)] as const));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const roomy = matchMedia(PIN_QUERY);
  const count = chapters.length;
  let frame = 0, pinned = false, near = false, listening = false;
  // Layout reads cached between resizes: the sticky offset (header height) and rail width.
  let measure = true, stickyTop = 0, railWidth = 0;

  const showAll = () => {
   rail.style.setProperty("--pos", "1");
   stops.forEach(stop => { stop.dataset.state = "reached"; });
   chapters.forEach(chapter => { chapter.dataset.state = "active"; });
   reveals.forEach(items => items.forEach(([el]) => { el.dataset.on = "true"; }));
  };

  const render = () => {
   frame = 0;
   if (!pinned) { showAll(); return; }
   if (measure) { stickyTop = parseFloat(getComputedStyle(stage).top) || 0; railWidth = rail.clientWidth; measure = false; }
   // 0 when the stage first sticks under the header, 1 when it is about to release.
   const raw = (stickyTop - track.getBoundingClientRect().top) / Math.max(1, track.offsetHeight - stage.clientHeight);
   const progress = clamp(raw);
   const active = Math.min(count - 1, Math.floor(progress * count));
   let pos = 0;
   for (let k = 1; k < count; k++) pos += ease(clamp((progress - k / count + DOT_WINDOW) / DOT_WINDOW));
   rail.style.setProperty("--pos", (pos / (count - 1)).toFixed(4));
   // Pixel translate keeps the dot inside the rail box (a % translate of a full-width wrapper overflowed the page).
   dot.style.transform = `translateX(${(pos / (count - 1) * railWidth).toFixed(1)}px)`;
   stops.forEach((stop, k) => { stop.dataset.state = k === active ? "active" : k < active ? "reached" : "pending"; });
   chapters.forEach((chapter, k) => { chapter.dataset.state = k === active ? "active" : k < active ? "before" : "after"; });
   reveals.forEach((items, k) => {
    const local = k === 0 ? (raw + LEAD_IN) / (REVEAL_SPAN / count) : (progress - k / count) / (REVEAL_SPAN / count);
    const q = clamp(local);
    items.forEach(([el, at]) => { el.dataset.on = String(q >= at); });
   });
  };

  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const listen = () => {
   const should = pinned && near;
   if (should === listening) return;
   listening = should;
   if (listening) addEventListener("scroll", schedule, { passive: true });
   else removeEventListener("scroll", schedule);
  };
  const setMode = () => {
   pinned = !reduced.matches && roomy.matches;
   section.dataset.mode = pinned ? "pinned" : "static";
   measure = true;
   listen(); schedule();
  };

  const proximity = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; listen(); schedule(); }, { rootMargin: "100% 0px" });
  const resize = new ResizeObserver(() => { measure = true; schedule(); });
  proximity.observe(track); resize.observe(stage);
  reduced.addEventListener("change", setMode); roomy.addEventListener("change", setMode);
  setMode();
  return () => {
   cancelAnimationFrame(frame); removeEventListener("scroll", schedule);
   proximity.disconnect(); resize.disconnect();
   reduced.removeEventListener("change", setMode); roomy.removeEventListener("change", setMode);
  };
 }, []);

 return <section ref={root} className="by-section hw-stages" aria-labelledby="hw-stages-title" data-mode="static">
  <div className="hw-track"><div className="hw-stage">
   <div className="hw-head"><p className="by-eyebrow">{stagesHead.eyebrow}</p><h2 id="hw-stages-title">{stagesHead.title}</h2></div>
   <div className="hw-rail" aria-hidden="true">
    <span className="hw-rail-line"><i /></span>
    <span className="hw-rail-dot" />
    <ol className="hw-stops" style={{ "--n": stages.length } as CSSProperties}>{stages.map((stage, k) => <li className="hw-stop" data-state="reached" style={{ "--k": k } as CSSProperties} key={stage.number}><span className="hw-stop-mark" /><span className="hw-stop-label"><span className="hw-stop-num">{stage.number}</span>{stage.name}</span></li>)}</ol>
   </div>
   <ol className="hw-chapters">
    {stages.map((stage, k) => <li className="hw-chapter by-grid" data-state="active" key={stage.number}>
     <div className="hw-copy by-span5">
      <p className="hw-num"><span>{stage.number}</span> · {stage.name}</p>
      <h3>{stage.title}</h3>
      <p className="hw-body">{stage.body}</p>
      <dl className="hw-split"><div><dt>From you</dt><dd>{stage.fromYou}</dd></div><div><dt>From us</dt><dd>{stage.fromUs}</dd></div></dl>
     </div>
     <div className="hw-ui-wrap by-span7" aria-hidden="true">{VIGNETTES[k]}</div>
    </li>)}
   </ol>
   <div className="hw-stage-foot" aria-hidden="true"><span className="hw-hint">Scroll through the {stages.length === 5 ? "five" : stages.length} steps<i /></span></div>
  </div></div>
 </section>;
}

function Head({ left, right }: { left: ReactNode; right?: ReactNode }) {
 return <div className="hw-ui-head">{left}{right}</div>;
}

const { target, build, reach, engage, handoff } = vignettes;

const VIGNETTES: ReactNode[] = [
 <div className="hw-ui" key="target">
  <Head left={<span className="hw-label">{target.heading}</span>} right={<span className="hw-tag hw-pop" data-at=".85">signed</span>} />
  <dl className="hw-std">{target.rows.map(([label, value], i) => <div className="hw-fade" data-at={(.05 + i * .12).toFixed(2)} key={label}><dt className="hw-label">{label}</dt><dd>{value}</dd></div>)}</dl>
  <div className="hw-std-signals hw-fade" data-at=".3">
   <span className="hw-label">Signals</span>
   <ul className="hw-sigs">{target.signals.map((signal, i) => <li key={signal}><i className={i < target.lit ? "hw-sig hw-dot" : "hw-sig"} data-lit={i < target.lit} data-at={i < target.lit ? (.42 + i * .12).toFixed(2) : undefined} />{signal}</li>)}</ul>
   <span className="hw-tag hw-pop" data-at=".62">{target.rule}</span>
  </div>
  <div className="hw-sign"><span className="hw-sign-line hw-draw" data-at=".72" /><span className="hw-label">{target.signed}</span></div>
 </div>,

 <div className="hw-ui" key="build">
  <Head left={<span className="hw-label">your email setup</span>} right={<span className="hw-label hw-accent hw-fade" data-at=".8">ready to send</span>} />
  <ul className="hw-domains">
   <li className="hw-domain hw-domain-own hw-fade" data-at=".05"><span>{build.own}</span><span className="hw-tag" data-muted="true">{build.ownStatus}</span></li>
   {build.lookalikes.map((domain, i) => <li className="hw-domain hw-fade" data-at={(.2 + i * .12).toFixed(2)} key={domain}><span>{domain}</span><span className="hw-warm"><i className="hw-draw" data-at={(.35 + i * .12).toFixed(2)} /></span><span className="hw-label hw-accent">{build.lookalikeStatus}</span></li>)}
   <li className="hw-domain hw-fade" data-at=".6"><span>{build.list}</span><span className="hw-check hw-dot" data-at=".7" /><span className="hw-label">{build.listStatus}</span></li>
  </ul>
 </div>,

 <div className="hw-ui" key="reach">
  <Head left={<span className="hw-label">{reach.heading}</span>} right={<span className="hw-label hw-accent hw-fade" data-at=".55">✓ inbox</span>} />
  <p className="hw-highlight hw-fade" data-at=".05">{reach.line}<small>{reach.lineCaption}</small></p>
  <ol className="hw-seq">{reach.emails.map((name, i) => <li className="hw-fade" data-at={(.18 + i * .12).toFixed(2)} key={name}>
   <i className={i === 0 ? "hw-seq-dot hw-dot" : "hw-seq-dot"} data-at={i === 0 ? ".5" : undefined} />
   <span>{name}</span>
   {i === 0 ? <span className="hw-swap" data-at=".5"><span className="hw-swap-a">sending…</span><span className="hw-swap-b">sent</span></span> : <span className="hw-muted">scheduled</span>}
  </li>)}</ol>
 </div>,

// Follow-ups and replies: routine replies are sorted automatically, the interested one goes to a person.
 <div className="hw-ui" key="engage">
  <Head left={<span className="hw-label">{engage.heading}</span>} right={<span className="hw-label hw-accent hw-fade" data-at=".85">{engage.status}</span>} />
  <ul className="hw-replies">
   {engage.replies.map((reply, i) => <li className="hw-fade" data-at={(.05 + i * .14).toFixed(2)} key={reply.tag}><span>{reply.text}</span><span className="hw-tag hw-fade" data-muted="true" data-at={(.16 + i * .14).toFixed(2)}>{reply.tag}</span></li>)}
   <li className="hw-reply-hot hw-fade" data-at=".38"><span>{engage.interested.text}</span><span className="hw-tag hw-pop" data-at=".5">{engage.interested.tag}</span></li>
  </ul>
  <span className="hw-link hw-draw-y" data-at=".6" />
  <span className="hw-chip hw-pop" data-at=".72">{engage.person}</span>
 </div>,

 // The booked call and its brief: the outcome, not a list of the steps described beside it.
 <div className="hw-ui" key="handoff">
  <Head left={<span className="hw-label">{handoff.heading}</span>} right={<span className="hw-tag hw-pop" data-at=".7">{handoff.tag}</span>} />
  <div className="hw-event hw-fade" data-at=".05">
   <p className="hw-event-title">{handoff.event}</p>
   <p className="hw-label">{handoff.who}</p>
   <div className="hw-event-brief">
    <span className="hw-label">{handoff.brief}</span>
    <ul className="hw-sigs">{target.signals.map((signal, i) => <li key={signal}><i className={i < target.lit ? "hw-sig hw-dot" : "hw-sig"} data-lit={i < target.lit} data-at={i < target.lit ? (.3 + i * .14).toFixed(2) : undefined} />{signal}</li>)}</ul>
   </div>
  </div>
  <span className="hw-chip hw-pop" data-at=".82">{handoff.chip}</span>
 </div>,
];

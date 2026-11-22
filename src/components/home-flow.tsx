"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { steps } from "@/content/process";

const FLOW = {
 breakpoint: 768,
 maxDt: .05,
 cameraSpeed: 9,
 cameraAnchor: .45,
 nodeInterval: .25,
 firstNodeThreshold: .004,
 dotThreshold: .02,
 dotFinish: .9,
 connectorStart: .14,
 connectorDuration: .11,
 nodeDuration: [.14, .14, .14, .18],
 targetRows: [
  ["AI consultancy, Bengaluru", "same buyer as your best client", "fit"],
  ["SaaS dev shop, Mumbai", "hiring after a new contract", "fit"],
  ["IT staffing agency", "outside your pattern", "skip"],
  ["Data engineering firm, NCR", "same stack, same size", "fit"],
 ],
 message: {
  recipient: "Founder, data engineering firm",
  subject: "Your move into platform work",
  highlight: "Saw your team took on its first warehouse migration this year.",
  caption: "↑ true only for them",
 },
 sendRows: [["Intro", "Tue, 9:40", "sent"], ["Follow-up", "Fri, 10:15", "scheduled"], ["Final note", "next week", "scheduled"]],
 reply: "“Timing is good. Can we talk Thursday?”",
 checklist: ["Who they are", "Why they replied", "What to say next"],
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;

export function HomeFlow() {
 const root = useRef<HTMLElement>(null);
 const motion = useRef({ progress: -1, camera: 0, last: 0, measure: true });

 useEffect(() => {
  const section = root.current!;
  const track = section.querySelector<HTMLElement>(".by-flow-track")!;
  const stage = section.querySelector<HTMLElement>(".by-flow-stage")!;
  const canvas = section.querySelector<HTMLElement>(".by-flow-canvas")!;
  const camera = section.querySelector<HTMLElement>(".by-flow-camera")!;
  const svg = section.querySelector<SVGSVGElement>(".by-flow-lines")!;
  const list = section.querySelector<HTMLOListElement>(".by-flow-nodes")!;
  const nodes = Array.from(section.querySelectorAll<HTMLElement>(".by-flow-node"));
  const underlays = Array.from(section.querySelectorAll<SVGPathElement>(".by-flow-underlay"));
  const fills = Array.from(section.querySelectorAll<SVGPathElement>(".by-flow-fill"));
  const dot = section.querySelector<SVGCircleElement>(".by-flow-dot")!;
  const count = section.querySelector<HTMLElement>(".by-flow-count")!;
  const bar = section.querySelector<HTMLElement>(".by-flow-bar i")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const tall = matchMedia("(min-height: 560px)");
  const m = motion.current;
  let frame = 0, pinned = false, near = false, listening = false;
  let lengths = [0, 0, 0], anchors = Array.from({ length: 3 }, () => ({ start: [0, 0], end: [0, 0] }));
  let ui: ReturnType<typeof cacheUi>;

  function cacheUi() {
   return {
    targetRows: Array.from(section.querySelectorAll<HTMLElement>(".by-flow-target tbody tr")),
    targetTags: Array.from(section.querySelectorAll<HTMLElement>(".by-flow-target .by-flow-tag")),
    skeleton: section.querySelector<HTMLElement>(".by-flow-skeleton")!,
    highlight: section.querySelector<HTMLElement>(".by-flow-highlight")!,
    sendRows: Array.from(section.querySelectorAll<HTMLElement>(".by-flow-timeline li")),
    sendStatus: section.querySelector<HTMLElement>(".by-flow-send-status")!,
    inbox: section.querySelector<HTMLElement>(".by-flow-inbox")!,
    delivery: section.querySelector<HTMLElement>(".by-flow-delivery")!,
    bubble: section.querySelector<HTMLElement>(".by-flow-reply")!,
    read: section.querySelector<HTMLElement>(".by-flow-read")!,
    checks: Array.from(section.querySelectorAll<HTMLElement>(".by-flow-check")),
    chip: section.querySelector<HTMLElement>(".by-flow-chip")!,
   };
  }

  const internal = (index: number, q: number) => {
   if (index === 0) ui.targetRows.forEach((row, j) => {
    const f = clamp(q * 4.5 - j * .7);
    row.style.opacity = String(.12 + .88 * f);
    row.style.transform = `translateX(${((1 - f) * 6).toFixed(2)}px)`;
    ui.targetTags[j].style.opacity = String(clamp((q - .45) * 4 - j * .3));
   });
   if (index === 1) {
    ui.skeleton.style.width = `${90 * easeOut(clamp(q * 1.8))}%`;
    const end = Math.round(FLOW.message.highlight.length * clamp((q - .2) * 1.6));
    ui.highlight.textContent = FLOW.message.highlight.slice(0, end);
   }
   if (index === 2) {
    ui.sendRows.forEach((row, j) => { row.style.opacity = String(.25 + .75 * clamp(q * 3 - j * .5)); });
    const sent = q > .45;
    ui.sendStatus.textContent = sent ? "sent" : "sending…";
    ui.sendRows[0].dataset.done = String(sent);
    const inbox = clamp((q - .55) * 4);
    ui.inbox.style.opacity = String(inbox);
    ui.inbox.style.transform = `scale(${.85 + .15 * inbox})`;
    ui.delivery.style.opacity = String(clamp((q - .75) * 4));
   }
   if (index === 3) {
    const bubble = clamp((q - .05) * 3);
    ui.bubble.style.opacity = String(bubble);
    ui.bubble.style.transform = `translateY(${((1 - bubble) * 6).toFixed(2)}px)`;
    ui.read.style.opacity = String(clamp((q - .3) * 3));
    ui.checks.forEach((check, j) => { check.dataset.checked = String(q > .45 + j * .13); });
    const chip = clamp((q - .78) * 5);
    ui.chip.style.opacity = String(chip);
    ui.chip.style.transform = `scale(${.9 + .1 * chip})`;
   }
  };

  const measure = () => {
   ui = cacheUi();
   const width = list.offsetWidth, height = list.offsetHeight;
   svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
   svg.style.width = `${width}px`; svg.style.height = `${height}px`;
   const mobile = innerWidth < FLOW.breakpoint;
   for (let k = 0; k < 3; k++) {
    const from = nodes[k], to = nodes[k + 1];
    let x1: number, y1: number, x2: number, y2: number, d: string;
    if (mobile) {
     x1 = from.offsetLeft + 18; y1 = from.offsetTop + from.offsetHeight;
     x2 = to.offsetLeft + 18; y2 = to.offsetTop;
     d = `M${x1},${y1}L${x2},${y2}`;
    } else if (k === 1) {
     x1 = from.offsetLeft + from.offsetWidth / 2; y1 = from.offsetTop + from.offsetHeight;
     x2 = to.offsetLeft + to.offsetWidth / 2; y2 = to.offsetTop;
     d = `M${x1},${y1}C${x1},${y1 + 28} ${x2},${y2 - 28} ${x2},${y2}`;
    } else {
     x1 = from.offsetLeft + from.offsetWidth; y1 = from.offsetTop + 28;
     x2 = to.offsetLeft; y2 = to.offsetTop + 28;
     const mid = (x1 + x2) / 2;
     d = `M${x1},${y1}C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
    }
    underlays[k].setAttribute("d", d); fills[k].setAttribute("d", d);
    lengths[k] = fills[k].getTotalLength();
    fills[k].style.strokeDasharray = `${lengths[k]} ${lengths[k]}`;
    anchors[k] = { start: [x1, y1], end: [x2, y2] };
   }
   m.measure = false;
  };

  const finalState = () => {
   nodes.forEach((node, index) => { node.dataset.state = "reached"; internal(index, 1); });
   fills.forEach(fill => { fill.style.strokeDashoffset = "0"; });
   const end = anchors[2].end;
   dot.setAttribute("cx", String(end[0])); dot.setAttribute("cy", String(end[1]));
   dot.setAttribute("r", "7"); dot.setAttribute("opacity", "1");
   count.textContent = "04 / 04"; bar.style.transform = "scaleX(1)";
   camera.style.transform = "translateY(0)";
  };

  const applyProgress = (progress: number) => {
   const active = progress > FLOW.firstNodeThreshold ? Math.min(3, Math.floor(progress / FLOW.nodeInterval)) : -1;
   nodes.forEach((node, index) => {
    const reached = index === 0 ? progress > FLOW.firstNodeThreshold : progress >= index * FLOW.nodeInterval;
    node.dataset.state = reached ? (index === active ? "active" : "reached") : "pending";
    internal(index, clamp((progress - index * FLOW.nodeInterval) / FLOW.nodeDuration[index]));
   });
   let moving = -1;
   fills.forEach((fill, index) => {
    const value = easeOut(clamp((progress - index * FLOW.nodeInterval - FLOW.connectorStart) / FLOW.connectorDuration));
    fill.style.strokeDashoffset = String(lengths[index] * (1 - value));
    if (value > 0 && value < 1) moving = index;
   });
   let point: [number, number];
   if (moving >= 0) {
    const offset = lengths[moving] - Number(fills[moving].style.strokeDashoffset);
    const current = fills[moving].getPointAtLength(offset);
    point = [current.x, current.y];
   } else {
    const next = fills.findIndex(fill => Number(fill.style.strokeDashoffset) > 0);
    point = next >= 0 ? anchors[next].start as [number, number] : anchors[2].end as [number, number];
   }
   dot.setAttribute("cx", String(point[0])); dot.setAttribute("cy", String(point[1]));
   dot.setAttribute("opacity", progress > FLOW.dotThreshold ? "1" : "0");
   dot.setAttribute("r", progress > FLOW.dotFinish ? "7" : "5");
   count.textContent = `0${Math.max(active, 0) + 1} / 04`;
   bar.style.transform = `scaleX(${progress})`;
  };

  const render = (now: number) => {
   frame = 0;
   const measured = m.measure;
   if (measured) measure();
   if (!pinned) { finalState(); return; }
   const stageHeight = stage.clientHeight;
   const progress = clamp(-track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - stageHeight));
   const changed = Math.abs(progress - m.progress) > .0001;
   if (changed || measured) { m.progress = progress; applyProgress(progress); }
   const active = progress > FLOW.firstNodeThreshold ? Math.min(3, Math.floor(progress / FLOW.nodeInterval)) : 0;
   const visibleHeight = canvas.clientHeight;
   const target = clamp((nodes[active].offsetTop + nodes[active].offsetHeight / 2 - visibleHeight * FLOW.cameraAnchor) / Math.max(1, list.offsetHeight - visibleHeight)) * Math.max(0, list.offsetHeight - visibleHeight);
   if (!changed && !measured && Math.abs(target - m.camera) < .1) return;
   const dt = m.last ? Math.min((now - m.last) / 1000, FLOW.maxDt) : 0;
   m.last = now;
   m.camera += (target - m.camera) * (1 - Math.exp(-FLOW.cameraSpeed * dt));
   if (Math.abs(target - m.camera) < .1) m.camera = target;
   camera.style.transform = `translateY(${-m.camera.toFixed(2)}px)`;
   if (Math.abs(target - m.camera) >= .1) schedule();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const scroll = () => { schedule(); };
  const listen = () => {
   const should = pinned && near;
   if (should === listening) return;
   listening = should;
   if (listening) { addEventListener("scroll", scroll, { passive: true }); scroll(); }
   else removeEventListener("scroll", scroll);
  };
  const setMode = () => {
   pinned = !reduced.matches && tall.matches;
   section.dataset.mode = pinned ? "pinned" : "static";
   m.progress = -1; m.camera = 0; m.last = 0; m.measure = true;
   listen(); schedule();
  };
  const resize = new ResizeObserver(() => { m.measure = true; schedule(); });
  const proximity = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; listen(); }, { rootMargin: "100% 0px" });
  ui = cacheUi();
  resize.observe(list); proximity.observe(track);
  reduced.addEventListener("change", setMode); tall.addEventListener("change", setMode);
  setMode();
  return () => {
   cancelAnimationFrame(frame); removeEventListener("scroll", scroll);
   resize.disconnect(); proximity.disconnect();
   reduced.removeEventListener("change", setMode); tall.removeEventListener("change", setMode);
  };
 }, []);

 return <section ref={root} className="by-section by-flow" aria-labelledby="flow-title" data-mode="static">
  <div className="by-flow-track"><div className="by-flow-stage">
   <div className="by-flow-head"><div><p className="by-eyebrow">How it works</p><h2 id="flow-title">Outbound built once, then owned.</h2></div><Link className="by-text-link" href="/how-it-works">See how it works<span aria-hidden="true">→</span></Link></div>
   <div className="by-flow-canvas"><div className="by-flow-camera">
    <svg className="by-flow-lines" aria-hidden="true" focusable="false">{[0, 1, 2].map(index => <g key={index}><path className="by-flow-underlay" /><path className="by-flow-fill" /></g>)}<circle className="by-flow-dot" r="7" opacity="0" /></svg>
    <ol className="by-flow-nodes">
     <FlowNode index={0}><table className="by-flow-target"><colgroup><col /><col /><col style={{ width: 44 }} /></colgroup><thead><tr><th>company</th><th>why</th><th /></tr></thead><tbody>{FLOW.targetRows.map(([company, why, tag]) => <tr key={company} data-skipped={tag === "skip"}><td>{company}</td><td>{why}</td><td><span className="by-flow-tag" data-muted={tag === "skip"}>{tag}</span></td></tr>)}</tbody></table></FlowNode>
     <FlowNode index={1}><div className="by-flow-message"><div className="by-flow-pair"><span className="by-flow-label">to</span><span className="by-flow-recipient">{FLOW.message.recipient}</span></div><div className="by-flow-pair"><span className="by-flow-label">subject</span><span>{FLOW.message.subject}</span></div><span className="by-flow-skeleton" /><div className="by-flow-highlight">{FLOW.message.highlight}</div><p className="by-flow-personal">{FLOW.message.caption}</p></div></FlowNode>
     <FlowNode index={2}><div className="by-flow-send"><div className="by-flow-ui-head"><span className="by-flow-label">sequence · one account</span><span className="by-flow-label by-flow-inbox">✓ inbox</span></div><ol className="by-flow-timeline">{FLOW.sendRows.map(([name, day, status], index) => <li key={name} data-done={index === 0}><span>{name}<small>{day}</small></span><span className={index === 0 ? "by-flow-send-status" : undefined}>{status}</span></li>)}</ol><span className="by-flow-tag by-flow-delivery">deliverability handled by us</span></div></FlowNode>
     <FlowNode index={3}><div className="by-flow-handover"><div className="by-flow-ui-head"><span className="by-flow-tag">interested</span><span className="by-flow-label by-flow-read">read within 2h</span></div><p className="by-flow-reply">{FLOW.reply}</p><p className="by-flow-label">context brief</p><ul>{FLOW.checklist.map(item => <li key={item}><span className="by-flow-check" data-checked="true" />{item}</li>)}</ul><span className="by-flow-chip">Handed to you · your move in 24h</span></div></FlowNode>
    </ol>
   </div></div>
   <div className="by-flow-foot" aria-hidden="true"><span className="by-flow-count">04 / 04</span><span className="by-flow-bar"><i /></span><span>Example, not client data</span></div>
  </div></div>
 </section>;
}

function FlowNode({ index, children }: { index: number; children: ReactNode }) {
 const step = steps[index];
 return <li className="by-flow-node" data-state="reached"><h3 aria-label={`${step.number} ${step.title}`}><span className="by-flow-num">{step.number}</span>{" "}{step.title}</h3><div className="by-flow-ui" aria-hidden="true">{children}</div><p>{step.summary}</p></li>;
}

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { alternate, at, boundaries, delivered, flightQuestions, fromYou, holding, phases, popups, routes, taxi } from "@/content/pilot-flight";

type ChecklistItem = { text: string; stage: number; progress: number };
function Checklist({ items }: { items: readonly ChecklistItem[] }) {
 return <ul className="pf-checks">{items.map(item => <li key={item.text} data-check={at(item.stage,item.progress)} data-filled="true"><i aria-hidden="true"/>{item.text}</li>)}</ul>;
}

function FlightChart() {
 return <div className="pf-canvas">
  <ol className="pf-phases">{phases.map((phase,index) => <li data-phase={index} data-status={index === 5 ? "current" : "done"} key={phase.name}><i/><span>{phase.name}<small>{phase.days}</small></span></li>)}</ol>
  <svg className="pf-chart" viewBox="0 0 1440 820" aria-hidden="true" focusable="false">
   <defs><pattern id="pf-grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="var(--pf-faint)"/></pattern><pattern id="pf-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V10" stroke="var(--rule)" strokeWidth="1"/></pattern></defs>
   <rect x="40" y="100" width="1360" height="540" fill="url(#pf-grid)" stroke="var(--rule)"/>
   <g className="pf-contours" fill="none" stroke="var(--rule)"><path d="M60 180C220 145 310 210 390 172S540 105 660 150"/><path d="M60 210C240 180 300 240 400 202S560 155 640 185"/><path d="M1120 160C1220 110 1370 190 1290 225S1120 223 1120 160Z"/><path d="M900 600C1030 555 1120 620 1250 582S1355 605 1390 590"/><path d="M960 628C1110 590 1160 650 1280 612S1355 630 1390 625"/></g>
   <rect x="520" y="170" width="220" height="160" fill="url(#pf-hatch)" stroke="var(--rule)"/>
   <text className="pf-map-label" x="528" y="160">TURBULENCE · DELIVERABILITY</text>
   {Array.from({length:69},(_,i)=><path key={i} d={`M${40+i*20} 640v${i%4===0?9:5}`} stroke="var(--ink-30)"/>)}
   <g className="pf-planned">{[...routes,alternate].map(d=><path key={d} d={d}/>)}</g>
   <path className="pf-entry" d={taxi}/><path className="pf-holding" d={holding}/>
   <text className="pf-loop-title" x="560" y="478" textAnchor="middle">HOLDING PATTERN</text><text className="pf-map-label" x="560" y="495" textAnchor="middle">NO LANDING SCHEDULED</text>
   {[304,552].map((y,i)=><g key={y}><rect x="1262" y={y} width="140" height="24" fill="var(--pf-card)" stroke="var(--ink)"/><path d={`M1272 ${y+12}H1395`} stroke="var(--ink)" strokeDasharray="8 7"/><text className="pf-map-label" x="1400" y={y-8} textAnchor="end">{i?"RWY ALT":"RWY 03"}</text></g>)}
   <g className="pf-flown">{routes.map((d,i)=><path data-route={i} key={d} d={d}/>)}<path className="pf-alternate" d={alternate}/></g>
   {[[90,560,"GATE · DAY 00"],[240,560,"TAKE-OFF · DAY 07"],[930,330,"HANDOVER · AROUND DAY 27"],[1150,430,"DECISION · DAY 60"]].map(([x,y,label],i)=><g key={label}><path d={`M${x} ${Number(y)-7}l-6 12h12Z`} fill="var(--paper)" stroke="var(--ink)"/><text className="pf-way-label" x={i===2?Number(x)+14:x} y={Number(y)+(i===2?5:27)} textAnchor={i===2?"start":i===3?"end":"middle"}>{label}</text></g>)}
   {popups.map((card,i)=><g key={card.label}><line data-leader={i} x1={card.anchor[0]} y1={card.anchor[1]} x2={card.x+card.w/2} y2={card.y+70} stroke="var(--accent)"/><g data-marker={i} transform={`translate(${card.anchor[0]-8} ${card.anchor[1]-8})`}><rect width="16" height="16" fill="var(--accent)"/><text x="8" y="12" textAnchor="middle" fill="var(--paper)" fontSize="11">{i+1}</text></g></g>)}
   <g className="pf-agency-trail">{Array.from({length:8},(_,i)=><circle key={i} r={5-i*.35} fill="var(--ink)" opacity={(8-i)/22}/>)}</g>
   <g className="pf-agency-dot" transform="translate(470 522)"><circle r="7.5" fill="var(--ink)" stroke="var(--paper)" strokeWidth="2"/><g transform="translate(14 -30)"><rect width="103" height="20" fill="var(--ink)"/><text x="8" y="14" className="pf-tag-text">USUAL AGENCY</text></g></g>
   <g className="pf-pilot-dot" transform="translate(1392 316)"><circle r="8.5" fill="var(--gold)" stroke="var(--accent)" strokeWidth="1.75"/><g className="pf-pilot-tag" transform="translate(15 -32)"><rect width="81" height="20" fill="var(--accent)"/><text x="8" y="14" className="pf-tag-text">THE PILOT</text></g></g>
   <text className="pf-map-label" x="52" y="626">ILLUSTRATIVE ROUTE, NOT CLIENT DATA</text>
  </svg>
  {popups.map((card,i)=><div className="pf-popup" data-popup={i} data-open={i>=4} key={card.label} style={{left:card.x,top:card.y,width:card.w}}><p className="pf-mono"><b>{i+1}</b>{card.label}</p><h3>{card.title}</h3><p>{card.body}</p></div>)}
  <div className="pf-agency-block"><p className="pf-mono"><i/>The usual agency <span>· circling, not landing</span></p><div><p className="pf-lap"><small>LAP</small><span>00</span></p><p data-agency-line>{phases[5].agency}</p></div></div>
  <p className="pf-floating-note" aria-hidden="true"/>
  <div className="pf-cockpit"><div><p className="pf-mono" data-phase-label>Landing · Day 60</p><p className="pf-stage-line" data-stage-line>{phases[5].line}</p></div><div><p className="pf-mono">From you, only this</p><Checklist items={fromYou}/></div><div><p className="pf-mono">On board, delivered by us</p><Checklist items={delivered}/></div></div>
 </div>;
}

function MobileRoute({ stationary }: { stationary: boolean }) {
 return <div className="pf-mobile">
  <svg className="pf-mobile-rail" aria-hidden="true"><path className="pf-mobile-plan"/><path className="pf-mobile-flown"/><circle className="pf-mobile-dot" r="8.5"/></svg>
  {phases.map((phase,i)=><section className="pf-mobile-phase" data-mobile-phase={i} key={phase.name}>
   <svg className="pf-mobile-waypoint" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3L3 16H17Z"/></svg>
   {i===2&&<svg className="pf-mobile-turbulence" aria-hidden="true"><defs><pattern id="pf-phone-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V10" stroke="var(--rule)"/></pattern></defs><rect width="100%" height="100%" fill="url(#pf-phone-hatch)"/></svg>}
   <p className="pf-mono">{phase.name} · {phase.days}</p><h3>{phase.line}</h3>
   {fromYou.some(item=>item.stage===i)&&<div className="pf-mobile-checks"><p className="pf-mono">From you</p><Checklist items={fromYou.filter(item=>item.stage===i)}/></div>}
   {delivered.some(item=>item.stage===i)&&<div className="pf-mobile-checks"><p className="pf-mono">Delivered by us</p><Checklist items={delivered.filter(item=>item.stage===i)}/></div>}
   <div className="pf-mobile-agency"><svg viewBox="0 0 64 34" aria-hidden="true"><path d="M15 27H49A10 10 0 0 0 49 7H15A10 10 0 0 0 15 27Z"/><circle r="3" cx="15" cy="27">{!stationary&&<animateMotion dur="6s" repeatCount="indefinite" path="M0 0H34A10 10 0 0 0 34 -20H0A10 10 0 0 0 0 0Z"/>}</circle></svg><div><p className="pf-mono">Usual agency · holding</p><p>{phase.agency}</p></div></div>
  </section>)}
  <div className="pf-mobile-landing"><svg viewBox="0 0 340 220" aria-hidden="true"><path className="pf-mobile-fork" d="M24 0C24 70 65 60 130 60H312"/><path className="pf-mobile-fork pf-alt-fork" d="M24 0C24 150 65 160 130 160H312"/>{[60,160].map(y=><g key={y}><rect x="125" y={y-11} width="190" height="22"/><path className="pf-runway-dash" d={`M134 ${y}H307`}/></g>)}<circle cx="24" cy="0" r="8"/><circle cx="313" cy="60" r="8"/><text x="125" y="25">DESTINATION</text><text x="125" y="42">3 QUALIFIED CONVERSATIONS</text><text x="125" y="195">ALTERNATE · MONEY BACK, IN CASH</text></svg></div>
 </div>;
}

const clamp = (n: number) => Math.max(0,Math.min(1,n));
export function PilotFlight() {
 const root = useRef<HTMLElement>(null);
 const [stationary,setStationary]=useState(true);
 useEffect(() => {
  const section = root.current!;
  const canvas = section.querySelector<HTMLElement>(".pf-canvas")!;
  const stage = section.querySelector<HTMLElement>(".pf-sticky")!;
  const mobile = section.querySelector<HTMLElement>(".pf-mobile")!;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width:760px)");
  const paths = Array.from(section.querySelectorAll<SVGPathElement>("[data-route]"));
  const lengths = paths.map(path=>path.getTotalLength());
  const alt = section.querySelector<SVGPathElement>(".pf-alternate")!;
  const loop = section.querySelector<SVGPathElement>(".pf-holding")!;
  const entry = section.querySelector<SVGPathElement>(".pf-entry")!;
  const loopLength = loop.getTotalLength(), entryLength = entry.getTotalLength();
  const pilot = section.querySelector<SVGGElement>(".pf-pilot-dot")!;
  const agency = section.querySelector<SVGGElement>(".pf-agency-dot")!;
  const trail = Array.from(section.querySelectorAll<SVGCircleElement>(".pf-agency-trail circle"));
  const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-popup]"));
  const markers = Array.from(section.querySelectorAll<SVGGElement>("[data-marker]"));
  const leaders = Array.from(section.querySelectorAll<SVGLineElement>("[data-leader]"));
  const phaseEls = Array.from(section.querySelectorAll<HTMLElement>("[data-phase]"));
  const checks = Array.from(canvas.querySelectorAll<HTMLElement>("[data-check]"));
  const blocks = Array.from(mobile.querySelectorAll<HTMLElement>("[data-mobile-phase]"));
  const rail = section.querySelector<SVGPathElement>(".pf-mobile-flown")!;
  const plan = section.querySelector<SVGPathElement>(".pf-mobile-plan")!;
  const mobileDot = section.querySelector<SVGCircleElement>(".pf-mobile-dot")!;
  const note = section.querySelector<HTMLElement>(".pf-floating-note")!;
  const stageLabel = section.querySelector<HTMLElement>("[data-phase-label]")!;
  const stageLine = section.querySelector<HTMLElement>("[data-stage-line]")!;
  const agencyLine = section.querySelector<HTMLElement>("[data-agency-line]")!;
  let frame=0, current=0, target=0, lastTime=0, idle=0, lastLap=-1, lastPhase=-1, noteTime=-10000, railLength=0, headerHeight=88;
  let active=true;
  let phaseAnimation: Animation | undefined;
  const render = (p: number, now: number) => {
   const nextBoundary=boundaries.findIndex((end,i)=>i>0&&p<end);
   const index=nextBoundary<0?5:nextBoundary-1;
   const local=clamp((p-boundaries[index])/(boundaries[index+1]-boundaries[index]));
   paths.forEach((path,i)=>{path.style.strokeDasharray=String(lengths[i]);path.style.strokeDashoffset=String(lengths[i]*(1-clamp((p-boundaries[i])/(boundaries[i+1]-boundaries[i]))));});
   alt.style.strokeDasharray="1 7";
   alt.style.clipPath=`inset(0 ${(1-clamp((p-.79)/.21))*100}% 0 0)`;
   const point=paths[index].getPointAtLength(lengths[index]*local);
   const wobble=!motion.matches&&point.x>=520&&point.x<=740?Math.sin(now*.025)*1.6:0;
   pilot.setAttribute("transform",`translate(${point.x} ${point.y+wobble})`);
   section.querySelector<SVGElement>(".pf-pilot-tag")!.style.opacity=index===5?"0":"1";
   canvas.style.setProperty("--flight-progress",String(p));
   phaseEls.forEach((el,i)=>el.dataset.status=i<index?"done":i===index?"current":"future");
   checks.forEach(el=>el.dataset.filled=String(p>=Number(el.dataset.check)));
   cards.forEach((card,i)=>{const item=popups[i],open=p>=item.open&&p<item.close;card.dataset.open=String(open);markers[i].style.opacity=p>=item.open&&!open?"1":"0";leaders[i].style.opacity=open?"1":"0";});
   if(index!==lastPhase){stageLabel.textContent=`${phases[index].name} · ${phases[index].days}`;stageLine.textContent=phases[index].line;agencyLine.textContent=phases[index].agency;phaseAnimation?.cancel();if(!motion.matches&&lastPhase>=0)phaseAnimation=stageLine.animate([{opacity:0,transform:"translateY(5px)"},{opacity:1,transform:"translateY(0)"}],{duration:200});lastPhase=index;}
   const laps=Math.max(0,(p-.12)*7+idle), lap=Math.floor(laps);
   const location=p<.12?entry.getPointAtLength(entryLength*p/.12):loop.getPointAtLength((laps%1)*loopLength);
   agency.setAttribute("transform",`translate(${location.x} ${location.y})`);
   trail.forEach((dot,i)=>{const t=p<.12?entry.getPointAtLength(Math.max(0,entryLength*p/.12-(i+1)*8)):loop.getPointAtLength(((laps-(i+1)*.012)%1+1)%1*loopLength);dot.setAttribute("cx",String(t.x));dot.setAttribute("cy",String(t.y));});
   section.querySelector(".pf-lap span")!.textContent=String(Math.min(99,lap)).padStart(2,"0");
   if(lap!==lastLap&&p>=.12&&!motion.matches){note.textContent=phases[index].notes[lap%2];noteTime=now;lastLap=lap;}
   const age=(now-noteTime)/2600;
   note.style.opacity=!motion.matches&&age>=0&&age<1?String(Math.sin(age*Math.PI)):"0";
   note.style.transform=`translateY(${-Math.min(1,Math.max(0,age))*24}px)`;
  };
  const updateTarget = () => {
   const rect=section.getBoundingClientRect();
   target=motion.matches?1:clamp((headerHeight-rect.top)/Math.max(1,section.offsetHeight-stage.offsetHeight));
   if(!desktop.matches||motion.matches){
    const rect=mobile.getBoundingClientRect();
    const progress=motion.matches?1:clamp((innerHeight*.6-rect.top)/Math.max(1,mobile.offsetHeight-220));
    rail.style.strokeDasharray=String(railLength);rail.style.strokeDashoffset=String(railLength*(1-progress));
    if(railLength){const pt=rail.getPointAtLength(railLength*progress);mobileDot.setAttribute("cx",String(pt.x));mobileDot.setAttribute("cy",String(pt.y));}
    blocks.forEach(block=>{const filled=motion.matches||block.getBoundingClientRect().top<innerHeight*.6;block.querySelectorAll<HTMLElement>("[data-check]").forEach(el=>el.dataset.filled=String(filled));});
   }
  };
  const tick = (now: number) => {
   frame=0;
   if(document.hidden||!active||motion.matches||!desktop.matches){lastTime=0;return;}
   if(current>=.12)idle+=Math.min(100,now-(lastTime||now))/1000*.06;lastTime=now;
   current+=(target-current)*.075;if(Math.abs(target-current)<.0001)current=target;
   render(current,now);frame=requestAnimationFrame(tick);
  };
  const wake=()=>{if(!frame&&!motion.matches&&desktop.matches&&active&&!document.hidden)frame=requestAnimationFrame(tick);};
  const measure=()=>{
   setStationary(motion.matches);
   headerHeight=document.querySelector(".by-top")?.getBoundingClientRect().height??88;
   section.dataset.enhanced="true";
   const scale=Math.min(stage.clientWidth/1440,stage.clientHeight/820);
   canvas.style.setProperty("--flight-scale",String(Math.max(.1,scale)));
   let d="M24 8";
   blocks.forEach((block,i)=>{const y=block.offsetTop+block.offsetHeight;d+=` C${i%2?4:44} ${block.offsetTop+block.offsetHeight*.35}, ${i%2?4:44} ${block.offsetTop+block.offsetHeight*.7}, 24 ${y}`;});
   rail.setAttribute("d",d);plan.setAttribute("d",d);railLength=rail.getTotalLength();
   updateTarget();current=target;render(current,performance.now());wake();
  };
  const onScroll=()=>{updateTarget();wake();};
  const onMode=()=>{cancelAnimationFrame(frame);phaseAnimation?.cancel();frame=0;measure();};
  const visible=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active)wake();else{cancelAnimationFrame(frame);frame=0;lastTime=0;current=target;render(current,performance.now());} });
  visible.observe(section);
  const resize=new ResizeObserver(measure);resize.observe(stage);resize.observe(mobile);
  addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",measure);
  document.addEventListener("visibilitychange",wake);motion.addEventListener("change",onMode);desktop.addEventListener("change",onMode);
  measure();
  return()=>{cancelAnimationFrame(frame);phaseAnimation?.cancel();visible.disconnect();resize.disconnect();removeEventListener("scroll",onScroll);removeEventListener("resize",measure);document.removeEventListener("visibilitychange",wake);motion.removeEventListener("change",onMode);desktop.removeEventListener("change",onMode);};
 },[]);
 return <section ref={root} className="pf-flight" aria-label="The Pilot flight plan"><div className="pf-sticky"><FlightChart/></div><MobileRoute stationary={stationary}/></section>;
}

export function PilotQuestions() {
 const [open,setOpen]=useState<number|null>(null);
 return <div className="pf-faq-list">{flightQuestions.map((item,i)=><div className="pf-faq-item" data-open={open===i} key={item.question}><h3><button type="button" aria-expanded={open===i} aria-controls={`pf-answer-${i}`} id={`pf-question-${i}`} onClick={()=>setOpen(open===i?null:i)}>{item.question}<i aria-hidden="true"/></button></h3><div className="pf-answer" id={`pf-answer-${i}`} role="region" aria-labelledby={`pf-question-${i}`} inert={open!==i}><div><p>{item.answer}</p></div></div></div>)}</div>;
}

export function PilotHeadline() {
 return <h1 className="pf-title" aria-label="Sixty days. Two runways. No holding pattern.">{"Sixty days. Two runways. No holding pattern.".split(" ").map((word,i)=><span key={i} aria-hidden="true" style={{"--word":i} as CSSProperties}>{word}{" "}</span>)}</h1>;
}

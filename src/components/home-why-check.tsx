"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { whyCheck } from "@/content/home";

// "Would you pay for this call?" The visitor judges four example calls against an example
// Qualification Standard; each answer checks the call line by line, lights the signals, and
// says whether it counts. Server HTML (and no-JS) is the answer key: every call with its verdict.
// After hydration it becomes the game. Motion is CSS only and respects reduced motion.
type Mode = "key" | "play" | "done";
const { standard, calls } = whyCheck;
const order = (k: number) => ({ "--k": k }) as CSSProperties;

export function HomeWhyCheck() {
 const [mode, setMode] = useState<Mode>("key");
 const [index, setIndex] = useState(0);
 const [answers, setAnswers] = useState<Array<boolean | null>>(() => calls.map(() => null));
 const result = useRef<HTMLDivElement>(null);
 const heading = useRef<HTMLHeadingElement>(null);
 const moved = useRef(false);

 // The game needs JS; until then (and without it) the answer key stays.
 useEffect(() => { setMode("play"); }, []);
 // Keyboard and screen-reader users: focus follows the game.
 useEffect(() => {
  if (!moved.current) return;
  if (answers[index] !== null) result.current?.focus(); else heading.current?.focus();
 }, [answers, index, mode]);

 const call = calls[index];
 const answer = answers[index];
 const answered = answer !== null;
 const choose = (pay: boolean) => { moved.current = true; setAnswers(list => list.map((value, k) => (k === index ? pay : value))); };
 const next = () => { moved.current = true; if (index < calls.length - 1) setIndex(index + 1); else setMode("done"); };
 const reset = () => { moved.current = true; setAnswers(calls.map(() => null)); setIndex(0); setMode("play"); };
 const paid = calls.filter(item => item.counts).length;

 if (mode === "key") return <div className="hm-check" data-mode="key">
  <Standard />
  <ol className="hm-key">{calls.map((item, k) => <li key={k} className="hm-call" data-state="answered">
   <p className="hm-call-head"><span>Call {k + 1} of {calls.length}</span></p>
   <h3 className="hm-call-who">{item.who}<span>{item.where}</span></h3>
   <p className="hm-call-story">{item.story}</p>
   <p className="hm-verdict" data-counts={item.counts}><i className="hm-token" aria-hidden="true" />{item.counts ? whyCheck.verdicts.yes : whyCheck.verdicts.no}</p>
   <p className="hm-why">{item.why}</p>
  </li>)}</ol>
 </div>;

 // Marks for the Standard: the current call once answered, otherwise pending.
 const marks = answered && mode === "play" ? call.checks : null;
 const lit = answered && mode === "play" ? call.signals : null;

 return <div className="hm-check" data-mode={mode}>
  <Standard marks={marks} lit={lit} />
  <div className="hm-desk">
   {mode === "play" ? <article className="hm-call" data-state={answered ? "answered" : "open"} key={index} aria-labelledby="hm-call-who">
    <p className="hm-call-head">
     <span>Call {index + 1} of {calls.length}</span>
     <span className="hm-pips" aria-hidden="true">{calls.map((_, k) => <i key={k} data-state={k < index ? (answers[k] === calls[k].counts ? "right" : "wrong") : k === index ? "now" : "next"} />)}</span>
    </p>
    <h3 className="hm-call-who" id="hm-call-who" tabIndex={-1} ref={heading}>{call.who}<span>{call.where}</span></h3>
    <p className="hm-call-story">{call.story}</p>
    {!answered ? <div className="hm-call-actions">
     <button type="button" className="hm-choice" data-pay="true" onClick={() => choose(true)}>{whyCheck.choices.yes}</button>
     <button type="button" className="hm-choice" onClick={() => choose(false)}>{whyCheck.choices.no}</button>
    </div> : <div className="hm-call-result" ref={result} tabIndex={-1} role="status">
     <p className="hm-verdict" data-counts={call.counts}><i className="hm-token" aria-hidden="true" />{call.counts ? whyCheck.verdicts.yes : whyCheck.verdicts.no}</p>
     <ul className="hm-result-checks" aria-hidden="true">{standard.rows.map(([label], k) => <li key={label} data-ok={call.checks[k]}>{label}</li>)}<li data-ok={call.signals.filter(Boolean).length >= 2}>Signals {call.signals.filter(Boolean).length} of 4</li></ul>
     <p className="hm-why"><strong>{answer === call.counts ? whyCheck.feedback.right : whyCheck.feedback.wrong}</strong> {call.why}</p>
     <button type="button" className="hm-next" onClick={next}>{index < calls.length - 1 ? whyCheck.next : whyCheck.finish}<span aria-hidden="true">→</span></button>
    </div>}
   </article> : <div className="hm-summary" ref={result} tabIndex={-1} role="status">
    <p className="hm-summary-count"><strong>{paid} of {calls.length}</strong> {whyCheck.summary.lead}</p>
    <ol className="hm-summary-calls">{calls.map((item, k) => <li key={k} data-counts={item.counts} style={order(k)}>
     <i className="hm-token" aria-hidden="true" /><span>{item.who}</span><span>{item.counts ? "You pay" : "No charge"}</span>
    </li>)}</ol>
    <p className="hm-summary-line">{whyCheck.summary.line}</p>
    <p className="hm-summary-actions">
     <button type="button" className="hm-next" onClick={reset}>{whyCheck.summary.again}<span aria-hidden="true">↺</span></button>
     <Link className="by-text-link" href="/how-it-works#hw-qual-title">{whyCheck.summary.rules}<span aria-hidden="true">↗</span></Link>
    </p>
   </div>}
  </div>
 </div>;
}

function Standard({ marks = null, lit = null }: { marks?: readonly boolean[] | null; lit?: readonly boolean[] | null }) {
 return <aside className="hm-std" aria-label={standard.label}>
  <p className="hm-std-head"><span>{standard.label}</span></p>
  <dl className="hm-std-rows">{standard.rows.map(([label, value], k) => <div className="hm-std-row" key={label} data-mark={marks ? String(marks[k]) : "none"}>
   <dt>{label}</dt><dd>{value}</dd>
   <i className="hm-mark" aria-hidden="true" />
   {marks && <span className="by-sr-only">{marks[k] ? ": yes" : ": no"}</span>}
  </div>)}</dl>
  <div className="hm-std-signals">
   <p>{standard.signalsLabel}</p>
   <ul>{standard.signals.map((signal, k) => <li key={signal} data-lit={lit ? String(lit[k]) : "none"} style={order(k)}><i aria-hidden="true" />{signal}{lit && <span className="by-sr-only">{lit[k] ? ", present" : ", missing"}</span>}</li>)}</ul>
  </div>
  <p className="hm-std-signed">{standard.signed}</p>
 </aside>;
}

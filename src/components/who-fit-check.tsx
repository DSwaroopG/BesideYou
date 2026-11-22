"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { fit, fitCheck, notFit } from "@/content/who-we-work-with";

// "Is this for you?" on /who-we-help. The four fit signs and the four reasons we say no, mixed, as
// things a visitor taps if they're true. The panel beside them gives a straight answer as they go.
// Server HTML (no JS) is a plain marked list: every item shows its explanation and whether it's a
// good sign. After hydration it becomes the check, with nothing picked.
type Item = { id: string; title: string; text: string; good: boolean };
const items: Item[] = fit.items.flatMap(([title, text], k) => {
 const [noTitle, noText] = notFit.items[k];
 return [{ id: `fit-${k}`, title, text, good: true }, { id: `no-${k}`, title: `${noTitle}.`, text: noText, good: false }];
});
const goodCount = fit.items.length;

export function WhoFitCheck() {
 const [mode, setMode] = useState<"static" | "check">("static");
 const [picked, setPicked] = useState<string[]>([]);
 useEffect(() => { setMode("check"); }, []);

 const chosen = items.filter(item => picked.includes(item.id));
 const good = chosen.filter(item => item.good).length;
 const bad = chosen.filter(item => !item.good);
 const verdict = bad.length ? "no" : good === 0 ? "none" : good === 1 ? "one" : good === goodCount ? "all" : "some";
 const [title, line] = fitCheck.verdicts[verdict];
 const toggle = (id: string) => setPicked(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

 return <div className="ww-check by-grid" data-mode={mode} data-verdict={verdict}>
  <ul className="ww-check-items" role="list">
   {items.map((item, k) => {
    const on = picked.includes(item.id);
    const inner = <>
     <span className="ww-pick-box" aria-hidden="true"><i /></span>
     <span className="ww-pick-title">{item.title}</span>
     <span className="ww-pick-more"><span className="ww-pick-inner">
      <span className="ww-pick-tag">{item.good ? fitCheck.fitTag : fitCheck.noTag}</span>
      <span className="ww-pick-text">{item.text}</span>
     </span></span>
    </>;
    return <li className="ww-rv" style={{ "--k": k } as CSSProperties} key={item.id}>
     {mode === "static"
      ? <div className="ww-pick" data-good={item.good} data-shown="true">{inner}</div>
      : <button type="button" className="ww-pick" aria-pressed={on} data-good={item.good} data-shown={on} onClick={() => toggle(item.id)}>{inner}</button>}
    </li>;
   })}
  </ul>
  <div className="ww-verdict" aria-live="polite">
   <div className="ww-verdict-card">
    <p className="ww-fitbar-label">{fitCheck.meter}</p>
    <div className="ww-fitbar" aria-hidden="true">{Array.from({ length: goodCount }, (_, k) => <i data-on={k < good && !bad.length} key={k} />)}</div>
    <h3 className="ww-verdict-title" key={verdict}>{title}</h3>
    <p className="ww-verdict-line">{line}</p>
    {bad.length > 0 && <ul className="ww-verdict-reasons">{bad.map(item => <li key={item.id}>{item.text}</li>)}</ul>}
    {picked.length > 0 && <button type="button" className="ww-reset" onClick={() => setPicked([])}>{fitCheck.reset}</button>}
   </div>
  </div>
 </div>;
}

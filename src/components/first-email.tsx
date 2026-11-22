"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { firstEmail as copy } from "@/content/solutions";

// "See the first email" on /solutions: three pickers and a live example email with numbered notes.
// The pickers are real radio buttons, so the page works (showing the first example) without JS.
// Lines that change after a pick rise in with a highlighter sweep; hovering or focusing a note lights
// up the line it explains, and the other way round.
export function FirstEmail() {
 const [firm, setFirm] = useState(0);
 const [buyer, setBuyer] = useState(0);
 const [trigger, setTrigger] = useState(0);
 // Change animations switch on after hydration, so the server HTML (and no-JS) never animates.
 const [touched, setTouched] = useState(false);
 useEffect(() => { setTouched(true); }, []);
 const [focus, setFocus] = useState<number | null>(null);

 const f = copy.firms[firm];
 const t = f.triggers[trigger];
 const role = f.buyers[buyer];
 const pickFirm = (k: number) => { setFirm(k); setBuyer(0); setTrigger(0); setTouched(true); };
 const lines = [t.opener, t.bridge, f.ask];
 const pin = (k: number) => ({ onPointerEnter: () => setFocus(k), onPointerLeave: () => setFocus(null) });

 return <div className="fe by-grid" data-touched={touched}>
  <form className="fe-pickers" onSubmit={event => event.preventDefault()} aria-label={copy.title}>
   <fieldset>
    <legend>{copy.pickers.firm}</legend>
    <div className="fe-chips">{copy.firms.map((option, k) => <label className="fe-chip" key={option.id}><input type="radio" name="fe-firm" value={option.id} checked={firm === k} onChange={() => pickFirm(k)} /><span>{option.label}</span></label>)}</div>
   </fieldset>
   <fieldset>
    <legend>{copy.pickers.buyer}</legend>
    <div className="fe-chips" key={f.id}>{f.buyers.map((option, k) => <label className="fe-chip" style={{ "--k": k } as CSSProperties} key={option}><input type="radio" name="fe-buyer" value={option} checked={buyer === k} onChange={() => { setBuyer(k); setTouched(true); }} /><span>{option}</span></label>)}</div>
   </fieldset>
   <fieldset>
    <legend>{copy.pickers.trigger}</legend>
    <div className="fe-chips fe-chips-stack" key={f.id}>{f.triggers.map((option, k) => <label className="fe-chip" style={{ "--k": k } as CSSProperties} key={option.id}><input type="radio" name="fe-trigger" value={option.id} checked={trigger === k} onChange={() => { setTrigger(k); setTouched(true); }} /><span>{option.label}</span></label>)}</div>
   </fieldset>
  </form>

  <div className="fe-mail-wrap">
   <article className="fe-mail" aria-label="The first email" data-focus={focus ?? "none"}>
    <dl className="fe-head">
     <div><dt>{copy.from}</dt><dd>{copy.signName} <span>&lt;{copy.sender}&gt;</span></dd></div>
     <div><dt>{copy.to}</dt><dd key={`${f.id}-${buyer}`} className="fe-swap">{f.name}, {role} at {f.company}</dd></div>
     <div><dt>{copy.subject}</dt><dd key={t.subject} className="fe-swap fe-subject">{t.subject}</dd></div>
    </dl>
    <div className="fe-body">
     <p key={`hi-${f.name}`} className="fe-swap">Hi {f.name},</p>
     {lines.map((line, k) => <p key={k} className="fe-line" data-on={focus === k} {...pin(k)}>
      <span className="fe-pin" aria-hidden="true">{k + 1}</span>
      <span key={line} className="fe-swap fe-text">{line}</span>
     </p>)}
     <p className="fe-sign">{copy.signName}<br />{copy.signFirm}</p>
    </div>
   </article>
   <ol className="fe-notes">{copy.notes.map((note, k) => <li key={note} data-on={focus === k} {...pin(k)}><span className="fe-pin" aria-hidden="true">{k + 1}</span>{note}</li>)}</ol>
   <p className="fe-foot">{copy.footnote}</p>
  </div>
 </div>;
}

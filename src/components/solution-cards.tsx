import type { CSSProperties } from "react";
import { solutions } from "@/content/solutions";

// The six parts on /solutions as short cards: a small drawing, a plain name and one line. The detail
// ("how it works" and what you get) sits behind a tap, so the page reads at a glance. Plain
// <details>, so it works without JavaScript; a deep link (/solutions#booking) opens its card
// (components/arrival.tsx). Drawings are decorative: ink lines, gold only as a fill.
type Icon = (typeof solutions.items)[number]["icon"];

function Drawing({ icon }: { icon: Icon }) {
 return <svg className={`sc-art sc-art-${icon}`} viewBox="0 0 64 48" aria-hidden="true" focusable="false">
  {icon === "find" && <><circle className="sc-fill" cx="44" cy="30" r="4" /><circle cx="28" cy="22" r="11" /><path d="M36 30 L46 40" /><path className="sc-soft" d="M8 40 H20 M8 34 H16" /></>}
  {icon === "check" && <><rect x="14" y="6" width="30" height="36" rx="2" /><path className="sc-soft" d="M24 16 H38 M24 25 H38 M24 34 H34" /><rect className="sc-fill" x="18" y="13" width="4" height="4" /><rect className="sc-fill" x="18" y="22" width="4" height="4" /><path d="M46 30 L50 34 L58 25" /></>}
  {icon === "write" && <><rect x="8" y="12" width="40" height="28" rx="2" /><path d="M8 14 L28 28 L48 14" /><path className="sc-fill" d="M50 6 L58 14 L46 26 L40 26 L40 20 Z" /></>}
  {icon === "reply" && <><path d="M8 10 H40 A4 4 0 0 1 44 14 V26 A4 4 0 0 1 40 30 H20 L12 36 V30 H8 A0 0 0 0 1 8 30 Z" /><path className="sc-soft" d="M16 18 H34 M16 23 H28" /><circle className="sc-fill" cx="52" cy="34" r="7" /></>}
  {icon === "calendar" && <><rect x="10" y="10" width="44" height="32" rx="2" /><path d="M10 19 H54 M22 6 V14 M42 6 V14" /><rect className="sc-soft-fill" x="16" y="24" width="7" height="6" /><rect className="sc-soft-fill" x="27" y="24" width="7" height="6" /><rect className="sc-fill" x="38" y="24" width="9" height="7" /><rect className="sc-soft-fill" x="16" y="33" width="7" height="5" /></>}
  {icon === "report" && <><path d="M10 40 H54" /><rect className="sc-soft-fill" x="14" y="26" width="8" height="14" /><rect className="sc-soft-fill" x="27" y="18" width="8" height="22" /><rect className="sc-fill" x="40" y="10" width="8" height="30" /></>}
 </svg>;
}

export function SolutionCards() {
 return <ol className="sc-grid sl-rv">
  {solutions.items.map((item, k) => <li className="sc-card" id={item.id} style={{ "--k": k } as CSSProperties} key={item.id}>
   <Drawing icon={item.icon} />
   <p className="sc-num"><span>{String(k + 1).padStart(2, "0")}</span></p>
   <h3 className="sc-name">{item.name}</h3>
   <p className="sc-line">{item.outcome}</p>
   <details className="sc-more">
    <summary><span>{solutions.open}</span><i aria-hidden="true">+</i></summary>
    <div className="sc-body">
     <p>{item.does}</p>
     <p className="sc-gets"><span>{solutions.gets}:</span> {item.deliverable}</p>
    </div>
   </details>
  </li>)}
 </ol>;
}

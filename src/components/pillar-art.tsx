// Small line drawings for the five pillars on /why-besideyou (decorative; styles in offer.css under
// .pa-). Each one loops gently while motion is allowed; without motion it holds its finished frame.
// Ink lines, the accent for marks, gold only as a fill.
type Kind = "philosophy" | "approach" | "execution" | "accountability" | "vision";
export const PILLAR_ART: Kind[] = ["philosophy", "approach", "execution", "accountability", "vision"];

const LOOP = "M40 26 H160 A22 22 0 0 1 160 70 H40 A22 22 0 0 1 40 26 Z";

export function PillarArt({ kind }: { kind: Kind }) {
 return <svg className={`pa pa-${kind}`} viewBox="0 0 200 110" aria-hidden="true" focusable="false">
  {kind === "philosophy" && <>
   {[22, 48, 74, 100, 126, 152, 178].map(x => <circle className={x === 126 ? "pa-dot pa-target" : "pa-dot"} cx={x} cy="78" r="4" key={x} />)}
   <g className="pa-glass"><circle cx="22" cy="68" r="15" /><path d="M33 79 L43 89" /></g>
   <g className="pa-bubble"><path d="M120 14 H178 A6 6 0 0 1 184 20 V38 A6 6 0 0 1 178 44 H138 L128 52 L130 44 H120 A6 6 0 0 1 114 38 V20 A6 6 0 0 1 120 14 Z" /><path className="pa-bubble-lines" d="M124 25 H170 M124 33 H158" /></g>
  </>}
  {kind === "approach" && <>
   <path className="pa-track" d={LOOP} />
   {[[40, 26], [160, 26], [160, 70], [40, 70]].map(([x, y], k) => <rect className="pa-node" x={x - 5} y={y - 5} width="10" height="10" style={{ animationDelay: `${k * 1.5}s` }} key={k} />)}
   <circle className="pa-runner" r="5" style={{ offsetPath: `path("${LOOP}")` }} />
  </>}
  {kind === "execution" && <>
   <rect className="pa-doc" x="44" y="12" width="92" height="88" />
   {[[56, 32, 124], [56, 46, 118], [56, 60, 124], [56, 74, 98]].map(([x, y, x2], k) => <path className="pa-line" d={`M${x} ${y} H${x2}`} pathLength={1} style={{ animationDelay: `${k * .25}s` }} key={k} />)}
   <g className="pa-check"><circle cx="140" cy="86" r="16" /><path d="M132 86 L138 92 L149 80" /></g>
  </>}
  {kind === "accountability" && <>
   <rect className="pa-cal" x="44" y="14" width="112" height="88" />
   <path className="pa-cal-head" d="M44 32 H156 M72 8 V20 M128 8 V20" />
   {[0, 1, 2].flatMap(r => [0, 1, 2, 3].map(c => <rect className={r === 1 && c === 2 ? "pa-cell pa-cell-on" : "pa-cell"} x={54 + c * 24} y={40 + r * 20} width="18" height="14" key={`${r}-${c}`} />))}
   <path className="pa-tick" d="M106 67 L110 71 L117 63" />
  </>}
  {kind === "vision" && <>
   <defs><clipPath id="pa-sky"><rect x="0" y="0" width="200" height="80" /></clipPath></defs>
   <g clipPath="url(#pa-sky)"><circle className="pa-sun" cx="150" cy="80" r="14" /></g>
   <path className="pa-horizon" d="M8 80 H192" />
   <path className="pa-road" d="M24 108 C 56 100, 86 92, 112 86" />
   <path className="pa-road pa-road-ahead" d="M112 86 C 126 83, 138 81, 150 80" />
   <circle className="pa-walker" r="4" style={{ offsetPath: `path("M24 108 C 56 100, 86 92, 112 86")` }} />
  </>}
 </svg>;
}

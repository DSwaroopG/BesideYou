import Link from "next/link";

const OPTIONS = [
 { number: "01", title: "Doing it yourself", route: "self", facts: ["Weeks of evenings", "Tool subscriptions and your own time", "Sunk time"] },
 { number: "02", title: "Hiring a junior BDE", route: "junior", facts: ["Thirty to sixty days including hiring", "A salary every month, indefinitely", "Sunk salary and a difficult conversation"] },
 { number: "03", title: "The BesideYou Pilot", route: "pilot", facts: ["Under seven days", "A fixed cost for one engagement", "Your money back"] },
] as const;

const LABELS = ["First email", "What it costs", "If it does not work"] as const;

function RouteGraphic({ route }: { route: (typeof OPTIONS)[number]["route"] }) {
 if (route === "self") return <svg className="by-opts-route" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path className="by-opts-route-path" d="M8 48 C34 48 31 72 58 70 C88 68 78 25 58 27 C40 29 54 63 84 51 C108 41 127 28 139 34 C154 43 128 72 115 64 C102 55 116 33 139 31 C164 30 153 63 180 59 C205 56 208 45 232 45 H298" /><circle className="by-opts-route-start" cx="8" cy="48" r="6" /><path className="by-opts-route-arrow" d="M298 38 L307 45 L298 52 Z" /></svg>;
 if (route === "junior") return <svg className="by-opts-route" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path className="by-opts-route-path" d="M8 65 H88 L106 47 H190 L209 28 H298" /><circle className="by-opts-route-start" cx="8" cy="65" r="6" /><circle cx="106" cy="47" r="5.5" /><circle cx="209" cy="28" r="5.5" /><path className="by-opts-route-arrow" d="M298 21 L307 28 L298 35 Z" /></svg>;
 return <svg className="by-opts-route" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path className="by-opts-route-path" d="M8 48 H290" /><circle className="by-opts-route-start" cx="8" cy="48" r="6" /><path className="by-opts-route-arrow" d="M290 41 L299 48 L290 55 Z" /><circle className="by-opts-route-end" cx="316" cy="48" r="8" /></svg>;
}

export function HomeOptionsContent() {
 return <div className="by-opts-track"><div className="by-opts-stage">
  <p className="by-eyebrow">Your options</p>
  <h2 id="opts-title">Three ways to get outbound running.</h2>
  <ol className="by-opts-grid" aria-label="How the three options compare on time, cost and risk">
   {OPTIONS.map(option => <li className={`by-opts-card${option.route === "pilot" ? " by-opts-pilot" : ""}`} key={option.number}>
    <p className="by-opts-number" aria-hidden="true">{option.number}</p>
    <h3>{option.title}</h3>
    <RouteGraphic route={option.route} />
    <dl className="by-opts-facts">{LABELS.map((label, index) => <div key={label}><dt>{label}</dt><dd>{option.facts[index]}</dd></div>)}</dl>
   </li>)}
  </ol>
  <div className="by-opts-foot"><p>No calls, no base fee.</p><Link className="by-action" href="/contact">Book a call<span aria-hidden="true">→</span></Link></div>
  <span className="by-opts-progress" aria-hidden="true"><i /></span>
 </div></div>;
}

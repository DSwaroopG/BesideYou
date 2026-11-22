import { FaqData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("The Pilot | BesideYou", "Sixty days. Three qualified conversations with decision-makers who match your ICP, or your money back in cash.", "/the-pilot", true);
import Link from "next/link";
import { PilotFlight, PilotHeadline, PilotQuestions } from "@/components/pilot-flight";
import { flightQuestions } from "@/content/pilot-flight";
import "./pilot.css";

export default function PilotPage() {
 return <div className="pf-page"><FaqData items={flightQuestions}/>
  <section className="pf-opening"><p className="pf-mono pf-kicker">The Pilot · Flight plan</p><PilotHeadline/>
   <p className="pf-lede">Most agencies take off and then circle: kickoff calls, activity reports, a request to renew. The Pilot files one route and lands it.</p>
   <dl className="pf-flight-strip">{[["Flight","The Pilot"],["Departs","Your best past clients"],["Destination","3 qualified conversations"],["Alternate","Money back, in cash"],["Duration","60 days"]].map(([label,value])=><div key={label}><dt className="pf-mono">{label}</dt><dd>{value}</dd></div>)}</dl>
   <p className="pf-depart pf-mono"><i aria-hidden="true"/>Scroll to depart<span aria-hidden="true"/></p>
  </section><PilotFlight/>
  <section className="pf-result" aria-labelledby="pf-result-title"><p className="pf-mono">Day 60 · Two runways</p><h2 id="pf-result-title">We land. We never circle.</h2><p className="pf-lede">There is no third outcome, no renewal pitch and no report of activity. At day 60 the Pilot lands on one of two runways.</p>
   <div className="pf-outcomes"><div><p className="pf-mono">Destination</p><h3>Three qualified conversations with people who can sign.</h3><p>Each one handed to you with a brief, ready to take.</p></div><div><p className="pf-mono">Alternate</p><h3>Your money back, in cash.</h3><p>Not credits. Not a free extension.</p></div></div>
   <Link className="by-action pf-book" href="/contact">Start with a Pilot<span aria-hidden="true">→</span></Link>
  </section><div className="pf-end pf-mono">End of flight</div>
  <section className="pf-faq" aria-labelledby="pf-faq-title"><p className="pf-mono">Questions</p><h2 id="pf-faq-title">Still deciding?</h2><PilotQuestions/></section>
 </div>;
}

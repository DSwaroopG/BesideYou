import Link from "next/link";
import type { CSSProperties } from "react";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/structure";
import { Questions } from "@/components/questions";
import { FaqData } from "@/components/structured-data";
import { HowStages } from "@/components/how-stages";
import { ScrollReveal } from "@/components/scroll-reveal";
import { closing, exclusions, faq, intro, meta, qualified, setup, terms } from "@/content/how-it-works";
import "./how.css";

export const metadata = pageMetadata(meta.title, meta.description, "/how-it-works", true);

// .hw-rv marks a scroll-in reveal (ScrollReveal + how.css). --k orders items inside one reveal.
const order = (k: number) => ({ "--k": k }) as CSSProperties;

function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
 return <div className="by-span5 hw-rv hw-rise"><p className="by-eyebrow">{eyebrow}</p><h2 id={id} style={{ marginTop: 8 }}>{title}</h2></div>;
}

export default function HowItWorksPage() {
 return <>
  <FaqData items={faq.items} />
  <ScrollReveal selector=".hw-rv" />
  <PageIntro label={intro.label} title={intro.title} lead={intro.lead} />

  <HowStages />

  <section className="by-section" aria-labelledby="hw-setup-title">
   <div className="by-grid"><SectionHead eyebrow={setup.eyebrow} title={setup.title} id="hw-setup-title" /></div>
   <ol className="hw-weeks hw-rv">
    {setup.weeks.map(([label, text], k) => <li className="hw-week" style={order(k)} key={label}><p className="hw-week-label">{label}</p><p>{text}</p></li>)}
   </ol>
   <p className="hw-note hw-rv hw-rise">{setup.note}</p>
  </section>

  <section className="by-section" aria-labelledby="hw-qual-title">
   <div className="by-grid"><SectionHead eyebrow={qualified.eyebrow} title={qualified.title} id="hw-qual-title" /><p className="by-span7 by-lead hw-rv hw-rise">{qualified.definition}</p></div>
   <div className="hw-model hw-rv">
    <div className="hw-model-head"><p>{qualified.caption}</p></div>
    <ol className="hw-signals">{qualified.signals.map(([name, line], k) => <li className="hw-signal" data-lit={k < qualified.lit} style={order(k)} key={name}><h3><i className="hw-sig" data-lit={k < qualified.lit} aria-hidden="true" />{name}</h3><p>{line}</p></li>)}</ol>
   </div>
   <dl className="hw-ledger">{qualified.rules.map(([label, text]) => <div className="hw-rv" key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
  </section>

  <section className="by-section" aria-labelledby="hw-terms-title">
   <div className="by-grid"><SectionHead eyebrow={terms.eyebrow} title={terms.title} id="hw-terms-title" /></div>
   <div className="hw-compare" role="table" aria-label={terms.compare.label}>
    <div className="hw-compare-row hw-compare-head hw-rv" role="row">
     <span role="columnheader"><span className="by-sr-only">{terms.compare.topic}</span></span>
     <span role="columnheader">{terms.compare.usual}</span>
     <span role="columnheader" className="hw-ours">{terms.compare.ours}</span>
    </div>
    {terms.compare.rows.map(([topic, usual, ours]) => <div className="hw-compare-row hw-rv" role="row" key={topic}>
     <span role="rowheader">{topic}</span>
     <span role="cell"><span className="hw-cell-label" aria-hidden="true">{terms.compare.usual}</span>{usual}</span>
     <span role="cell" className="hw-ours"><span className="hw-cell-label" aria-hidden="true">{terms.compare.ours}</span>{ours}</span>
    </div>)}
   </div>
   <Link className="by-text-link hw-motion-link hw-rv hw-rise" href="/why-besideyou">See it in motion<span aria-hidden="true">↗</span></Link>
  </section>

  <section className="by-section" aria-labelledby="hw-not-title">
   <div className="by-grid"><SectionHead eyebrow={exclusions.eyebrow} title={exclusions.title} id="hw-not-title" />
    <div className="by-span7 hw-not-group hw-rv"><ul className="hw-not">{exclusions.items.map((item, k) => <li style={order(k)} key={item}>{item}</li>)}</ul><p className="by-lead hw-not-line">{exclusions.line}</p></div>
   </div>
  </section>

  <section className="by-section hw-faq" aria-labelledby="hw-faq-title">
   <div className="by-grid"><SectionHead eyebrow={faq.eyebrow} title={faq.title} id="hw-faq-title" /><div className="by-span7"><Questions items={faq.items} itemClassName="hw-rv hw-rise" /></div></div>
  </section>

  <section className="by-section by-grid hw-close" aria-labelledby="hw-close-title">
   <div className="by-span8 hw-rv hw-rise"><h2 id="hw-close-title">{closing.title}</h2></div>
   <Link className="by-action by-span4 hw-rv hw-rise" href="/contact">{closing.cta}<span aria-hidden="true">↗</span></Link>
  </section>
 </>;
}

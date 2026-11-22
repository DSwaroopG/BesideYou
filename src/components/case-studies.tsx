import { caseStudies, caseStudiesHead } from "@/content/case-studies";

// Real case studies only (see content/case-studies.ts). Renders nothing while the list is empty, so
// the structure can ship before the first result exists. `rv` adds the host page's scroll-reveal
// classes (e.g. "of-rv of-rise"); styles are global (.by-case) because two pages use it.
export function CaseStudies({ rv = "" }: { rv?: string }) {
 if (caseStudies.length === 0) return null;
 const { labels } = caseStudiesHead;
 return <section className="by-section" aria-labelledby="case-title">
  <div className="by-grid">
   <div className={`by-span5 ${rv}`}><p className="by-eyebrow">{caseStudiesHead.eyebrow}</p><h2 id="case-title" style={{ marginTop: 8 }}>{caseStudiesHead.title}</h2></div>
   <p className={`by-span7 by-lead ${rv}`}>{caseStudiesHead.note}</p>
  </div>
  <ul className="by-cases">{caseStudies.map(study => <li className={`by-case ${rv}`} id={study.id} key={study.id}>
   <p className="by-case-head"><span>{study.client}</span><span>{study.market}</span></p>
   <p className="by-case-calls"><span className="by-case-figure">{study.qualifiedCalls}</span><span className="by-case-label">{labels.qualifiedCalls} · {study.duration}</span></p>
   <dl className="by-case-rows">
    <div><dt>{labels.startingPoint}</dt><dd>{study.startingPoint}</dd></div>
    <div><dt>{labels.implemented}</dt><dd>{study.implemented}</dd></div>
    {study.improvements.length > 0 && <div><dt>{labels.improvements}</dt><dd><ul>{study.improvements.map(item => <li key={item}>{item}</li>)}</ul></dd></div>}
   </dl>
  </li>)}</ul>
 </section>;
}

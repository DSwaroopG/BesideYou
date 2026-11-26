import Link from "next/link";
import type { CSSProperties } from "react";
import { problem, solutionsPreview, whoPreview, whyCheck } from "@/content/home";
import { solutions } from "@/content/solutions";
import { faq } from "@/content/faq";
import { Questions } from "@/components/questions";
import { FaqData } from "@/components/structured-data";
import { HomeWhoPeople } from "@/components/home-who-people";
import { HomeWhyCheck } from "@/components/home-why-check";

// Homepage sections between the hero and the closing (v3.0). Server components; scroll-in reveals
// come from ScrollReveal with .hm-rv (see app/home.css). Each section previews a page and links to it.
const order = (k: number) => ({ "--k": k }) as CSSProperties;

function Head({ eyebrow, title, id, wide = false }: { eyebrow: string; title: string; id: string; wide?: boolean }) {
 return <div className={`${wide ? "by-span8" : "by-span5"} hm-rv hm-rise`}><p className="by-eyebrow">{eyebrow}</p><h2 id={id} style={{ marginTop: 8 }}>{title}</h2></div>;
}

// 2. The problem, then the same four things with and without a system.
export function HomeProblem() {
 return <section className="by-section" aria-labelledby="hm-problem-title">
  <div className="by-grid hm-head"><Head eyebrow={problem.eyebrow} title={problem.title} id="hm-problem-title" /><p className="by-span7 by-lead hm-rv hm-rise">{problem.lead}</p></div>
  <div className="hm-contrast" role="table" aria-label={`${problem.usual} compared with ${problem.ours}`}>
   <div className="hm-contrast-row hm-contrast-head" role="row"><span role="columnheader">{problem.usual}</span><span role="columnheader" className="hm-ours">{problem.ours}</span></div>
   {problem.rows.map(([usual, ours], k) => <div className="hm-contrast-row hm-rv" role="row" style={order(k)} key={usual}>
    <span role="cell" className="hm-usual">{usual}</span>
    <span role="cell" className="hm-ours">{ours}</span>
   </div>)}
  </div>
 </section>;
}

// 3. The six outcomes as one connected system, linking to /solutions.
export function HomeSolutions() {
 return <section className="by-section" aria-labelledby="hm-solutions-title">
  <div className="by-grid"><Head eyebrow={solutionsPreview.eyebrow} title={solutionsPreview.title} id="hm-solutions-title" wide /></div>
  <ol className="hm-system hm-rv">{solutions.items.map((item, k) => <li style={order(k)} key={item.id}>
   <Link href={`/solutions#${item.id}`}>
    <span className="hm-node" aria-hidden="true" />
    <span className="hm-num"><span>{String(k + 1).padStart(2, "0")}</span> · {item.name}</span>
    <span className="hm-outcome">{item.outcome}</span>
   </Link>
  </li>)}</ol>
  <Link className="by-text-link hm-rv hm-rise" href="/solutions">{solutionsPreview.link}<span aria-hidden="true">↗</span></Link>
 </section>;
}

// 4. The four people, live in 3D (components/home-who-people.tsx), each linking to their chapter.
export function HomeWho() {
 return <section className="by-section" aria-labelledby="hm-who-title">
  <div className="by-grid"><Head eyebrow={whoPreview.eyebrow} title={whoPreview.title} id="hm-who-title" wide /></div>
  <HomeWhoPeople />
  <div className="hm-who-foot hm-rv hm-rise"><p>{whoPreview.more}</p><Link className="by-text-link" href="/who-we-help">{whoPreview.link}<span aria-hidden="true">↗</span></Link></div>
 </section>;
}

// 5. Why BesideYou: try the deal. Four example calls, judged against an example Standard.
export function HomeWhy() {
 return <section className="by-section" aria-labelledby="hm-why-title">
  <div className="by-grid hm-head"><Head eyebrow={whyCheck.eyebrow} title={whyCheck.title} id="hm-why-title" /><p className="by-span7 by-lead hm-rv hm-rise">{whyCheck.lead}</p></div>
  <HomeWhyCheck />
  <Link className="by-text-link hm-rv hm-rise" href="/why-besideyou">{whyCheck.link}<span aria-hidden="true">↗</span></Link>
 </section>;
}

// 7. Questions founders ask before they book (the owner's list), with FAQPage structured data.
export function HomeFaq() {
 return <section className="by-section hm-faq" aria-labelledby="hm-faq-title">
  <FaqData items={faq.items} />
  <div className="by-grid"><Head eyebrow={faq.eyebrow} title={faq.title} id="hm-faq-title" /><div className="by-span7"><Questions phoneLimit={5} items={faq.items} itemClassName="hm-rv hm-rise" /></div></div>
 </section>;
}

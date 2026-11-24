import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageBreadcrumb, ServiceData } from "@/components/structured-data";
import { PageIntro } from "@/components/structure";
import { ScrollReveal } from "@/components/scroll-reveal";
import { closing, firstEmail, intro, keep, meta, offer, provide, solutions, who } from "@/content/solutions";
import { SolutionCards } from "@/components/solution-cards";
import { FirstEmail } from "@/components/first-email";
import { examples } from "@/content/who-we-work-with";
import "./solutions.css";

export const metadata = pageMetadata(meta.title, meta.description, "/solutions", true);

// .sl-rv marks a scroll-in reveal (ScrollReveal + solutions.css).
function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
 return <div className="by-span5 sl-rv sl-rise"><p className="by-eyebrow">{eyebrow}</p><h2 id={id} style={{ marginTop: 8 }}>{title}</h2></div>;
}

export default function SolutionsPage() {
 return <>
  <PageBreadcrumb name="Solutions" path="/solutions" /><ServiceData />
  <ScrollReveal selector=".sl-rv" />
  <PageIntro label={intro.label} title={intro.title} lead={intro.lead} />

  {/* The six parts as short cards; the detail opens on tap (components/solution-cards.tsx). */}
  <section className="by-section" aria-labelledby="sl-system-title">
   <div className="by-grid sl-head"><SectionHead eyebrow={solutions.eyebrow} title={solutions.title} id="sl-system-title" /><p className="by-span7 by-lead sl-rv sl-rise">{solutions.note}</p></div>
   <SolutionCards />
   <Link className="by-text-link sl-rv sl-rise" href="/how-it-works">{solutions.link}<span aria-hidden="true">↗</span></Link>
  </section>

  {/* Try it: the first email for the visitor's own kind of firm and buyer (example only). */}
  <section className="by-section" aria-labelledby="sl-try-title">
   <div className="by-grid sl-head"><SectionHead eyebrow={firstEmail.eyebrow} title={firstEmail.title} id="sl-try-title" /><p className="by-span7 by-lead sl-rv sl-rise">{firstEmail.lead}</p></div>
   <div className="sl-rv sl-rise"><FirstEmail /></div>
  </section>

  <section className="by-section by-grid sl-offer" aria-labelledby="sl-offer-title">
   <div className="by-span5 sl-rv sl-rise"><p className="by-eyebrow">{offer.eyebrow}</p><h2 id="sl-offer-title" style={{ marginTop: 8 }}>{offer.title}</h2></div>
   <div className="by-span7 sl-rv sl-rise">
    <p className="by-lead sl-offer-line">{offer.line}</p>
    <Link className="by-text-link" href="/why-besideyou">{offer.link}<span aria-hidden="true">↗</span></Link>
   </div>
  </section>

  <section className="by-section" aria-labelledby="sl-who-title">
   <div className="by-grid"><SectionHead eyebrow={who.eyebrow} title={who.title} id="sl-who-title" />
    <div className="by-span7 sl-rv sl-rise">
     <ul className="sl-who">{examples.map(example => <li key={example.id}><Link href={`/who-we-help#${example.id}`}>{example.name}<span aria-hidden="true">↗</span></Link></li>)}</ul>
     <p className="sl-who-line">{who.line}</p>
     <Link className="by-text-link" href="/who-we-help">{who.link}<span aria-hidden="true">↗</span></Link>
    </div>
   </div>
  </section>

  <section className="by-section by-grid sl-trade" aria-label="Your part and what you keep">
   <div className="sl-half sl-rv sl-rise">
    <p className="by-eyebrow">{provide.eyebrow}</p><h2 style={{ marginTop: 8 }}>{provide.title}</h2>
    <ol className="sl-provide">{provide.items.map((item, k) => <li key={item}><span aria-hidden="true">{String(k + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
   </div>
   <div className="sl-half sl-rv sl-rise">
    <p className="by-eyebrow">{keep.eyebrow}</p><h2 style={{ marginTop: 8 }}>{keep.title}</h2>
    <p className="sl-keep">{keep.line}</p>
   </div>
  </section>

  <section className="by-section by-grid sl-close" aria-labelledby="sl-close-title">
   <div className="by-span8 sl-rv sl-rise"><h2 id="sl-close-title">{closing.title}</h2></div>
   <Link className="by-action by-span4 sl-rv sl-rise" href="/contact">{closing.cta}<span aria-hidden="true">↗</span></Link>
  </section>
 </>;
}

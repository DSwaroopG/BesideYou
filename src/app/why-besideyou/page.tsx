import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageBreadcrumb } from "@/components/structured-data";
import { PageIntro } from "@/components/structure";
import { ScrollReveal } from "@/components/scroll-reveal";
import { OfferFlight } from "@/components/offer-flight";
import { CaseStudies } from "@/components/case-studies";
import { PillarArt, PILLAR_ART } from "@/components/pillar-art";
import { closing, intro, meta, pillars, vision } from "@/content/why-besideyou";
import "./offer.css";

// Why BesideYou: the circling-vs-landing flight story (accountability, shown), then the owner's five
// pillars (philosophy, approach, execution, accountability, vision), then real case studies once
// they exist. The flight scene is a prototype pending Subham's review.
export const metadata = pageMetadata(meta.title, meta.description, "/why-besideyou", true);

const num = (k: number) => String(k + 1).padStart(2, "0");

export default function WhyPage() {
 return <>
  <PageBreadcrumb name="Why BesideYou" path="/why-besideyou" />
  <ScrollReveal selector=".of-rv" />
  <PageIntro label={intro.label} title={intro.title} lead={intro.lead} />

  <OfferFlight />

  <section className="by-section" aria-labelledby="of-pillars-title">
   <div className="by-grid"><div className="by-span5 of-rv of-rise"><p className="by-eyebrow">{pillars.eyebrow}</p><h2 id="of-pillars-title" style={{ marginTop: 8 }}>{pillars.title}</h2></div></div>
   <ol className="of-pillars">
    {pillars.items.map((item, k) => <li className="of-pillar of-rv" key={item.label}>
     <div className="of-pillar-side"><p className="of-pillar-label"><span>{num(k)}</span>{item.label}</p><PillarArt kind={PILLAR_ART[k]} /></div>
     <div className="of-pillar-body">
      <h3>{item.title}</h3>
      <p>{item.text}</p>
      {"link" in item && <Link className="by-text-link" href={item.link.href}>{item.link.label}<span aria-hidden="true">↗</span></Link>}
     </div>
    </li>)}
    <li className="of-pillar of-rv">
     <div className="of-pillar-side"><p className="of-pillar-label"><span>{num(pillars.items.length)}</span>{vision.label}</p><PillarArt kind="vision" /></div>
     <div className="of-pillar-body">
      <h3>{vision.title}</h3>
      <div className="of-horizons">
       {(["today", "next"] as const).map(key => <div className={`of-horizon of-horizon-${key}`} key={key}>
        <p className="of-horizon-label">{vision[key].label}</p><h4>{vision[key].title}</h4><p>{vision[key].text}</p>
       </div>)}
      </div>
     </div>
    </li>
   </ol>
  </section>

  <CaseStudies rv="of-rv of-rise" />

  <section className="by-section by-grid of-close" aria-labelledby="of-close-title">
   <div className="by-span8 of-rv of-rise"><h2 id="of-close-title">{closing.title}</h2></div>
   <Link className="by-action by-span4 of-rv of-rise" href="/contact">{closing.cta}<span aria-hidden="true">↗</span></Link>
  </section>
 </>;
}

import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageBreadcrumb } from "@/components/structured-data";
import { PageIntro } from "@/components/structure";
import { ScrollReveal } from "@/components/scroll-reveal";
import { WhoExamples } from "@/components/who-examples";
import { WhoFitCheck } from "@/components/who-fit-check";
import { closing, fitCheck, intro, meta } from "@/content/who-we-work-with";
import "./who.css";

export const metadata = pageMetadata(meta.title, meta.description, "/who-we-help", true);

// .ww-rv marks a scroll-in reveal (ScrollReveal + who.css).
function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
 return <div className="by-span5 ww-rv ww-rise"><p className="by-eyebrow">{eyebrow}</p><h2 id={id} style={{ marginTop: 8 }}>{title}</h2></div>;
}

// Who We Help (route renamed from /who-we-work-with, which redirects here). The reasons that used to
// close this page now live on /why-besideyou.
export default function WhoWeHelpPage() {
 return <>
  <PageBreadcrumb name="Who we help" path="/who-we-help" />
  <ScrollReveal selector=".ww-rv" />
  <PageIntro label={intro.label} title={intro.title} lead={intro.lead} />

  <WhoExamples />

  {/* Fit signs and the reasons we say no, as one tap-to-answer check (static marked list without JS). */}
  <section className="by-section" aria-labelledby="ww-fit-title">
   <div className="by-grid ww-check-head"><SectionHead eyebrow={fitCheck.eyebrow} title={fitCheck.title} id="ww-fit-title" /><p className="by-span7 by-lead ww-rv ww-rise">{fitCheck.lead}</p></div>
   <WhoFitCheck />
  </section>

  <section className="by-section by-grid ww-close" aria-labelledby="ww-close-title">
   <div className="by-span8 ww-rv ww-rise"><h2 id="ww-close-title">{closing.title}</h2></div>
   <Link className="by-action by-span4 ww-rv ww-rise" href="/contact">{closing.cta}<span aria-hidden="true">↗</span></Link>
  </section>
 </>;
}

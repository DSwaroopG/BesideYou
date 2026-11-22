import { BreadcrumbData } from "@/components/structured-data";
import Link from "next/link";
import { PageIntro, PilotLink } from "@/components/structure";
import { guarantee } from "@/content/pilot";
import { segments, type Segment } from "@/content/segments";

export function SegmentPage({ segment }: { segment: Segment }) {
  const sibling = segments[(segments.findIndex(item => item.slug === segment.slug) + 1) % segments.length];
  return <><BreadcrumbData headline={segment.headline} slug={segment.slug} /><PageIntro title={segment.headline} lead={segment.opening} /><section className="by-section by-grid"><h2 className="by-span4">What we do</h2><div className="by-span8 by-prose">{segment.whatWeDo.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></section><section className="by-section by-grid"><h2 className="by-span12">The Pilot</h2><div className="by-span12"><p className="by-lead by-segment-guarantee">{guarantee}</p><Link className="by-text-link" href="/the-pilot">The Pilot<span aria-hidden="true">↗</span></Link></div></section><div className="by-pilot-answers"><p>Full answers on how the Pilot works are on the <Link href="/the-pilot">Pilot page</Link>.</p></div><div className="by-closing by-grid"><div className="by-span5"><PilotLink /></div><Link className="by-text-link by-span7" href={`/outbound/${sibling.slug}`}>{sibling.headline}<span aria-hidden="true">↗</span></Link></div></>;
}

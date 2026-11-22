import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/structure";
import { sent } from "@/content/contact";

// Landing page for a brief sent without JavaScript (the API redirects here after a native POST).
// With JavaScript the confirmation shows in place on /contact instead. Not indexed.
export const metadata = pageMetadata(sent.metaTitle, sent.lead, "/contact/sent", false);

export default function ContactSentPage() {
 return <>
  <PageIntro title={sent.title} lead={sent.lead} />
  <section className="by-section by-grid">
   <Link className="by-text-link by-span4" href="/how-it-works">{sent.link}<span aria-hidden="true">↗</span></Link>
  </section>
 </>;
}

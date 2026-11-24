import { siteUrl } from "@/lib/metadata";
export function JsonLd({ data }: { data: unknown }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(data).replace(/</g,"\\u003c") }} />; }
export function OrganizationData() {
 return <JsonLd data={{ "@context":"https://schema.org", "@type":"Organization", name:"BesideYou", url:siteUrl, logo:`${siteUrl}/by-logo.png`, email:"hello@besideyou.io", sameAs:["https://www.linkedin.com/company/wearebesideyou","https://x.com/besideyou_io","https://www.instagram.com/wearebesideyou"], address:{ "@type":"PostalAddress", addressLocality:"Bhubaneswar", addressRegion:"Odisha", addressCountry:"IN" } }} />;
}
export function FaqData({ items }: { items: ReadonlyArray<{ question:string; answer:string }> }) {
 return <JsonLd data={{ "@context":"https://schema.org", "@type":"FAQPage", mainEntity:items.map(item => ({ "@type":"Question", name:item.question, acceptedAnswer:{ "@type":"Answer", text:item.answer } })) }} />;
}
export function BreadcrumbData({ headline,slug }: { headline:string; slug:string }) {
 return <JsonLd data={{ "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"BesideYou", item:siteUrl },{ "@type":"ListItem", position:2, name:headline, item:`${siteUrl}/outbound/${slug}` }] }} />;
}
// The site itself (helps Google show the site name in results).
export function WebsiteData() {
 return <JsonLd data={{ "@context":"https://schema.org", "@type":"WebSite", name:"BesideYou", url:siteUrl, publisher:{ "@type":"Organization", name:"BesideYou", url:siteUrl } }} />;
}
// The service, in plain words. No prices: they're agreed on the call.
export function ServiceData() {
 return <JsonLd data={{ "@context":"https://schema.org", "@type":"Service", name:"Pay Per Qualified Call", serviceType:"B2B lead generation", description:"BesideYou finds your buyers through cold email, follows up, and books sales calls on your calendar. You keep the system and pay only when a call with the right buyer actually happens.", provider:{ "@type":"Organization", name:"BesideYou", url:siteUrl }, audience:{ "@type":"BusinessAudience", audienceType:"Founder-led B2B firms" }, url:`${siteUrl}/solutions` }} />;
}
// Home > page, for the main pages.
export function PageBreadcrumb({ name, path }: { name: string; path: string }) {
 return <JsonLd data={{ "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"Home", item:siteUrl },{ "@type":"ListItem", position:2, name, item:`${siteUrl}${path}` }] }} />;
}

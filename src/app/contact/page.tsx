import { pageMetadata } from "@/lib/metadata";
import { PageBreadcrumb } from "@/components/structured-data";
import { PageIntro } from "@/components/structure";
import { ContactExperience } from "@/components/contact-experience";
import { intro, meta } from "@/content/contact";
import "./contact.css";

export const metadata = pageMetadata(meta.title, meta.description, "/contact", true);

export default function ContactPage() {
 return <>
  <PageBreadcrumb name="Book a strategy call" path="/contact" />
  <PageIntro title={intro.title} lead={intro.lead} />
  <ContactExperience />
 </>;
}

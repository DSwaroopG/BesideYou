import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Terms of Service | BesideYou", "Terms of Service. Updating soon.", "/terms", false);
import { PageIntro } from "@/components/structure";
export default function TermsPage() { return <PageIntro title="Terms of Service" lead="Updating soon." />; }

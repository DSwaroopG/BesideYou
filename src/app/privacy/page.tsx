import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Privacy Policy | BesideYou", "Privacy Policy. Updating soon.", "/privacy", false);
import { PageIntro } from "@/components/structure";
export default function PrivacyPage() { return <PageIntro title="Privacy Policy" lead="Updating soon." />; }

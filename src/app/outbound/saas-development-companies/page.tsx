import { pageMetadata } from "@/lib/metadata";
import { SegmentPage } from "@/components/segment-page";
import { segments } from "@/content/segments";
export const metadata = pageMetadata(segments[1].title, segments[1].opening, "/outbound/saas-development-companies");
export default function Page() { return <SegmentPage segment={segments[1]} />; }

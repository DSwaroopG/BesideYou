import { pageMetadata } from "@/lib/metadata";
import { SegmentPage } from "@/components/segment-page";
import { segments } from "@/content/segments";
export const metadata = pageMetadata(segments[0].title, segments[0].opening, "/outbound/ai-consulting-firms");
export default function Page() { return <SegmentPage segment={segments[0]} />; }

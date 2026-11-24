import { pageMetadata } from "@/lib/metadata";
import { SegmentPage } from "@/components/segment-page";
import { segments } from "@/content/segments";
export const metadata = pageMetadata(segments[2].title, segments[2].opening, "/outbound/data-engineering-firms", false);
export default function Page() { return <SegmentPage segment={segments[2]} />; }

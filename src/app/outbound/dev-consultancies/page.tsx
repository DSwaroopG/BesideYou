import { pageMetadata } from "@/lib/metadata";
import { SegmentPage } from "@/components/segment-page";
import { segments } from "@/content/segments";
export const metadata = pageMetadata(segments[3].title, segments[3].opening, "/outbound/dev-consultancies", false);
export default function Page() { return <SegmentPage segment={segments[3]} />; }

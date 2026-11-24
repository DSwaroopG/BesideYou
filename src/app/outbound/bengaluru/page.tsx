import { pageMetadata } from "@/lib/metadata";
import { SegmentPage } from "@/components/segment-page";
import { segments } from "@/content/segments";
export const metadata = pageMetadata(segments[4].title, segments[4].opening, "/outbound/bengaluru", false);
export default function Page() { return <SegmentPage segment={segments[4]} />; }

import { pageMetadata } from "@/lib/metadata";
import { SegmentPage } from "@/components/segment-page";
import { segments } from "@/content/segments";
export const metadata = pageMetadata(segments[5].title, segments[5].opening, "/outbound/mumbai");
export default function Page() { return <SegmentPage segment={segments[5]} />; }

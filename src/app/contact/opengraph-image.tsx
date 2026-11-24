import { shareImage, shareSize, shareType } from "@/og/share-image";

// The picture shown when this page is shared (design in src/og/share-image.tsx).
export const alt = "Book a strategy call with BesideYou";
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
 return shareImage({ label: "Book a call", title: "Book a strategy call.", line: "Bring your hard questions. We reply within one working day." });
}

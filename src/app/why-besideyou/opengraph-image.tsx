import { shareImage, shareSize, shareType } from "@/og/share-image";

// The picture shown when this page is shared (design in src/og/share-image.tsx).
export const alt = "Why BesideYou: we only get paid when a qualified call lands";
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
 return shareImage({ label: "Why BesideYou", title: "We only get paid when a qualified call lands.", line: "The system is yours, and we only get paid when a call happens." });
}

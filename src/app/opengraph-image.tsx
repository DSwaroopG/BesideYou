import { shareImage, shareSize, shareType } from "@/og/share-image";

// The picture shown when this page is shared (design in src/og/share-image.tsx).
export const alt = "BesideYou: the system that finds your clients, and you pay only when a call happens";
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
 return shareImage({ label: "Pay Per Qualified Call", title: "The system that finds your clients should belong to you, not to your agency.", line: "You pay only when a call with the right buyer actually happens." });
}

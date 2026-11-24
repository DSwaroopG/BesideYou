import { shareImage, shareSize, shareType } from "@/og/share-image";

// The picture shown when this page is shared (design in src/og/share-image.tsx).
export const alt = "How BesideYou works, step by step";
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
 return shareImage({ label: "How it works", title: "What happens after you say yes.", line: "Five steps, about three weeks to the first email." });
}

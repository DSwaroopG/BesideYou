import { shareImage, shareSize, shareType } from "@/og/share-image";

// The picture shown when this page is shared (design in src/og/share-image.tsx).
export const alt = "Who BesideYou helps: founder-led B2B firms";
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
 return shareImage({ label: "Who we help", title: "For founder-led teams whose growth still depends on reaching the right buyers, not more of them.", line: undefined });
}

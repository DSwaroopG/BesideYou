import { shareImage, shareSize, shareType } from "@/og/share-image";

// The picture shown when this page is shared (design in src/og/share-image.tsx).
export const alt = "BesideYou solutions: finding buyers, writing to them and booking the call";
export const size = shareSize;
export const contentType = shareType;

export default function Image() {
 return shareImage({ label: "Solutions", title: "The whole job, from finding your buyers to booking the call.", line: "Six things, done for you, as one system." });
}

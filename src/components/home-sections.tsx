import { HomeDifference } from "@/components/home-difference";
import { HomeOptions as HomeOptionsShell } from "@/components/home-options";
import { HomeOptionsContent } from "@/components/home-options-content";
export { HomeHero } from "@/components/home-hero";
export { HomeFlow as HomeProcess } from "@/components/home-flow";

export function ContrastSection() {
 return <HomeDifference />;
}
export function HomeOptions() { return <HomeOptionsShell><HomeOptionsContent /></HomeOptionsShell>; }
export { HomeClosing } from "@/components/home-closing";

import { pageMetadata } from "@/lib/metadata";
import { meta } from "@/content/home";
import { HomeHero } from "@/components/home-hero";
import { HomeClosing } from "@/components/home-closing";
import { HomeFaq, HomeProblem, HomeSolutions, HomeWho, HomeWhy } from "@/components/home-v3";
import { CaseStudies } from "@/components/case-studies";
import { ScrollReveal } from "@/components/scroll-reveal";
import "./home.css";

export const metadata = pageMetadata(meta.title, meta.description, "/", true);

// v3.0 homepage: it sells the outcome, not the technology.
// Hero, Problem, Solutions, Who benefits, Why BesideYou, case studies (hidden until a real one
// exists), FAQ, final CTA.
export default function HomePage() {
 return <>
  <ScrollReveal selector=".hm-rv" />
  <HomeHero />
  <HomeProblem />
  <HomeSolutions />
  <HomeWho />
  <HomeWhy />
  <CaseStudies rv="hm-rv hm-rise" />
  <HomeFaq />
  <HomeClosing />
 </>;
}

// Copy for /who-we-help (v3.0; formerly /who-we-work-with): the brief's "who it is for" page.
// The "Why BesideYou" reasons moved to content/why-besideyou.ts.
// Source of truth: docs/besideyou-company-context.md, docs/besideyou-positioning-one-pager.md and
// docs/website-build-brief-swaroop.md. Lines marked LOCKED must not be reworded. All other lines
// are drafts pending owner review.
// Rules: segments are examples, never the whole audience. Fit criteria in plain words: no team
// sizes, years or headcounts. No prices or commercial terms, no em dashes, never call BesideYou
// an agency, no made-up numbers.

export const meta = {
 title: "Who We Help: Founder-Led B2B Firms | BesideYou",
 description: "For founder-led teams whose growth still depends on reaching the right buyers, not more of them. B2B lead generation for AI and data teams, software studios, managed IT providers and B2B service firms.",
} as const;

export const intro = {
 label: "Who we help",
 // LOCKED who-it-is-for line.
 title: "For founder-led teams whose growth still depends on reaching the right buyers, not more of them.",
 lead: "B2B firms where the founder still does the selling and has no time left to go looking for clients. We do the looking, and you take the calls.",
} as const;

// The four examples follow the brief's locked hero rotation (AI and data teams / software studios /
// managed IT providers / B2B service firms, resting on "and other founder-led B2B sellers").
// Each is presented as a person (an illustrative, faceless 3D figure) who explains their card as
// you scroll. Ids double as deep links: /who-we-help#managed-it.
// Speech lines (drafts) follow the owner's per-customer structure (2026-11-16): who they are, their
// growth problem, why traditional outbound is not working, what BesideYou changes, and the outcome
// to expect. Line 0 plays as the person walks in; lines 1 to 4 pair with the card row they point at
// (buyer, market, opening line, qualified call). Outcome lines say what to expect, never results
// achieved, so they cannot read as testimonials.
export const examplesHead = {
 eyebrow: "Who they are",
 title: "Four kinds of firm we know well.",
 more: "These are the markets we started in. Other founder-led B2B sellers fit too, as long as the founder still sells.",
 hint: "Scroll to meet them",
 stamp: "Qualified",
 people: "For each customer type, a person stands beside the card and points at each row while they explain it.",
 // One label per speech line, in order.
 speechLabels: ["Who we are", "The growth problem", "Why cold email hasn’t worked", "What changes", "What to expect"],
 labels: { buyer: "Your buyer", market: "Their market", line: "An opening line", call: "A qualified call" },
 signals: ["Need", "Timing", "Money", "Next step"],
} as const;

export const examples = [
 {
  id: "ai-and-data",
  name: "AI and data teams",
  speech: [
   "We build models and data platforms for other companies.",
   "Referrals got us here. The CTOs we want have never heard of us.",
   "We emailed anyone with data in their title. Nobody we wanted replied.",
   "Each first email opens with something true, like their first data hire.",
   "Calls with the right buyers, and we pay only when one actually happens.",
  ],
  buyer: "CTO · Head of Data",
  market: "Companies with more data than people to use it",
  line: "Saw you are hiring your first data engineer.",
  lit: ["Need", "Timing"],
 },
 {
  id: "software-studios",
  name: "Software studios",
  speech: [
   "We design and build software products for founders and product teams.",
   "Projects come in waves, and in between I’m the only one selling.",
   "The cold emails we tried went to everyone. Hardly any had a real roadmap.",
   "The opener points at what they are about to build.",
   "Fewer, better calls with founders who are ready to build.",
  ],
  buyer: "Founder · Head of Product",
  market: "Product teams with more roadmap than engineers",
  line: "Saw your roadmap promises a mobile app this year.",
  lit: ["Need", "Money"],
 },
 {
  id: "managed-it",
  name: "Managed IT providers",
  speech: [
   "We run IT for businesses in one or two industries.",
   "Word of mouth keeps us busy, but the owner still does all the selling.",
   "Generic IT emails go to every business. The practices we know ignore them.",
   "The opener names something that just changed for their practice.",
   "Calls with owners who have a real need and agree to a next step.",
  ],
  buyer: "Owner · Practice manager",
  market: "Clinics, law firms and accounting practices",
  line: "Saw your practice is hiring for a second location.",
  lit: ["Need", "Next step"],
 },
 {
  id: "b2b-service",
  name: "B2B service firms",
  speech: [
   "We sell a specialist service, and I still close every deal.",
   "Referrals got us here, but I can’t plan a quarter around them.",
   "Big, vague lead lists. Few of them looked like our best clients.",
   "Every opener shows we did our homework on them.",
   "Calls with buyers who have the timing and the budget.",
  ],
  buyer: "Founder · Managing director",
  market: "Companies that look like your best clients",
  line: "Saw you are expanding into a new region.",
  lit: ["Timing", "Money"],
 },
] as const;

export const fit = {
 eyebrow: "Fit",
 title: "Signs you are a fit.",
 items: [
  ["The founder still sells.", "You close the deals yourself, or with one business-development hire beside you."],
  ["Referrals got you here.", "Most clients came through people who already knew you, and that flow is slowing."],
  ["You sell work worth a real call.", "Each new client matters enough that one good conversation changes the month."],
  ["You’ve sold it before.", "The service works. What’s missing is a steady way to reach new buyers."],
 ],
} as const;

export const notFit = {
 eyebrow: "Not a fit",
 title: "Where we say no.",
 items: [
  ["You already have a sales team", "If you already pay people to do outreach, we’d just get in their way."],
  ["You want volume", "We go after the right buyers. If you just want more email going out, we’re the wrong people."],
  ["The service is still new", "We need something the market already buys, so the calls we book can close."],
  ["You sell to consumers", "We only reach businesses."],
 ],
} as const;

// Fit check (components/who-fit-check.tsx): the fit signs and the reasons we say no, mixed together
// as things a visitor can tap if they're true. Draft copy for owner review. Without JavaScript it
// renders as a plain list with each item marked.
export const fitCheck = {
 eyebrow: "Fit check",
 title: "Is this for you?",
 lead: "Tap whatever sounds like your business. We’ll tell you straight whether we can help.",
 fitTag: "Good sign",
 noTag: "Not for us",
 meter: "Signs of a fit",
 verdicts: {
  none: ["Tap what sounds like you.", "Some of these point to a good fit. Some mean we’d be the wrong people. No wrong answers."],
  one: ["Could be a fit.", "One good sign is a start. A short call would tell us both."],
  some: ["Sounds like a good fit.", "That’s most of what we look for. The call is where we look at your market together."],
  all: ["You’re who we built this for.", "Every sign is there. Bring your hard questions to the call."],
  no: ["Honestly, we’re probably not right for you.", "Better to hear it now than after you’ve signed. Here’s why:"],
 },
 reset: "Start over",
} as const;

export const closing = {
 title: "Sounds like you? Let’s talk.",
 cta: "Book a Strategy Call",
} as const;

// Copy for /why-besideyou (formerly the offer page; /the-pilot, /pilot and the old
// offer URL redirect here). Trust comes from the model, not proof: the brief rules out
// testimonials, team sections and made-up numbers. Lines marked LOCKED must not be reworded; all
// other lines are drafts pending owner review.
// Rules: no prices or commercial terms, no em dashes, never call BesideYou an agency, no counters,
// no made-up numbers, no "Pilot", "Pipeline" or "qualified conversations".

export const meta = {
 title: "Why BesideYou: Pay Per Qualified Call | BesideYou",
 description: "Why founder-led B2B firms choose BesideYou: you keep the system, you decide which calls count, and we only get paid when a qualified call actually happens.",
} as const;

export const intro = {
 label: "Why BesideYou",
 title: "We only get paid when a qualified call lands.",
 lead: "Most firms charge you every month, whether calls happen or not. We work the other way round: the system is yours, and we only get paid when a call happens.",
} as const;

// Four beats of the pinned flight scene. `at` is where each beat starts on the scroll track (0 to 1).
export const flight = {
 description: "A grey plane circles in a holding pattern above a runway while a white plane with a gold tail flies straight in and lands.",
 hint: "Scroll to fly",
 beats: [
  { at: 0, title: "Most firms bill you monthly.", line: "Like a plane circling: the bill keeps running, calls or not." },
  { at: .22, title: "Pay Per Qualified Call.", line: "One straight route to a call on your calendar." }, // LOCKED offer name in the title.
  { at: .48, title: "We get paid when we land.", line: "Landing means a real call with the right buyer." },
 ],
} as const;

// The owner's five pillars (2026-11-16): philosophy, approach, execution, accountability, vision.
// Titles stay close to Subham's wording; the supporting lines carry the facts from the company
// context (the old six reasons are folded in here). No guaranteed results, years of experience,
// client counts or testimonials.
export const pillars = {
 eyebrow: "What we believe",
 title: "Built to sit on your side of the desk.",
 items: [
  {
   label: "Our philosophy",
   title: "Software should do the hunting, so you can do the talking.",
   text: "Finding and chasing buyers eats the hours a founder should spend on calls, and on the work clients actually pay for. We hand that part to the system.",
  },
  {
   label: "Our approach",
   title: "One system that does the whole job.",
   text: "Finding buyers, writing to them, following up and booking the call all run together, so nothing falls between tools. And it’s yours: the list, the email addresses and the emails stay with you, during the work and after it.",
  },
  {
   label: "Our execution",
   title: "AI does the legwork, and people check it.",
   text: "Software and AI take care of the repetitive parts. People take care of the judgement: you approve every email before it goes out, and someone on our team answers every interested reply the same business day. It all goes out from separate email addresses under your brand’s name, never your main one.",
  },
  {
   label: "Our accountability",
   title: "We’re paid for results you can count.",
   text: "We get paid when a call with the right buyer actually happens, and the checklist you signed decides what counts, not us.",
   link: { label: "What counts as a qualified call", href: "/how-it-works#hw-qual-title" },
  },
 ],
} as const;

// Two horizons: sell what is delivered today, and show the larger ambition without selling it as
// if it already exists. ("Pipeline" is an old offer word, so the future horizon avoids it.)
export const vision = {
 label: "Our vision",
 title: "We’re building toward a full revenue system.",
 today: {
  label: "Today",
  title: "Cold email that books calls with the right buyers.",
  text: "Cold email, powered by AI, that finds the right buyers and gets them on a call with you. That’s what we offer today, as Pay Per Qualified Call.",
 },
 next: {
  label: "Where we’re going",
  title: "One system for all of your selling.",
  text: "Later, one system for how your company finds and wins business, from the first hello to every signed deal. We’re working on it, and it’s not for sale yet.",
 },
} as const;

export const closing = {
 title: "Let’s plan your route.",
 cta: "Book a Strategy Call",
} as const;

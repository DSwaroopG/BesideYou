// Copy for the homepage (v3.0): it sells the outcome, not the technology. Sections: Hero
// (components/home-hero.tsx, locked lines), Problem, Solutions, Who benefits, Why BesideYou,
// final CTA (components/home-closing.tsx). Lines marked LOCKED must not be reworded; all other
// lines are drafts pending owner review.
// Rules: no prices or commercial terms, no em dashes, never call BesideYou an agency, no made-up
// numbers, no "Pilot", "Pipeline" or "qualified conversations"; "B2B lead generation" retired as too generic (2026-11-24): we say "booked sales calls".

export const meta = {
 title: "Pay Per Qualified Call: Booked Sales Calls | BesideYou",
 description: "BesideYou finds your buyers through cold email and books sales calls with them. You keep the system and pay only when a call with the right buyer happens.",
} as const;

export const problem = {
 eyebrow: "The problem",
 title: "A good service, and no time to go hunting.",
 lead: "Your best clients came from people who already knew you. Referrals got you here, but they arrive when they arrive, and the founder is still the one selling.",
 usual: "Without a system",
 ours: "With BesideYou",
 rows: [
  ["You send when you have time.", "It sends whether you have time or not."],
  ["Nobody owns the follow-up.", "Interested replies get an answer the same business day."],
  ["The list goes stale.", "Every buyer is checked and researched before we write."],
  ["You pay for effort, whatever comes of it.", "You pay when a qualified call actually happens."],
 ],
} as const;

export const solutionsPreview = {
 eyebrow: "What we do",
 title: "We handle everything from the first list to the booked call.",
 link: "See what’s included",
} as const;

export const whoPreview = {
 eyebrow: "Who it’s for",
 // LOCKED who-it-is-for line.
 title: "For founder-led teams whose growth still depends on reaching the right buyers, not more of them.",
 more: "And other founder-led B2B sellers.",
 link: "See who we help",
} as const;

// "Would you pay for this call?" (components/home-why-check.tsx): four example calls judged against
// an example Qualification Standard, using the real rules in docs/besideyou-company-context.md
// (the right buyer, inside the market, at least two of four signals, and the call has to happen).
export const whyCheck = {
 eyebrow: "Why BesideYou",
 title: "We only get paid when a qualified call lands.",
 lead: "Easy to say, so try it. Here are four calls. Tap the ones you’d pay for, and see what our rules say.",
 standard: {
  label: "Your buyer checklist",
  rows: [
   ["Buyer", "A founder or the CTO"],
   ["Market", "Software companies that sell to other businesses"],
   ["The call", "Actually happens"],
  ],
  signalsLabel: "Plus at least two of these",
  signals: ["Need", "Timing", "Money", "Next step"],
  signed: "You sign this before we send a single email.",
 },
 calls: [
  {
   who: "CTO", where: "B2B software company",
   story: "Replied to the second email. They’re rebuilding their data setup this quarter and the budget is already approved.",
   checks: [true, true, true], signals: [true, true, true, true], counts: true,
   why: "Right person, right company, all four signals. This is exactly the call you asked for.",
  },
  {
   who: "Marketing intern", where: "B2B software company",
   story: "Loved the email and booked a call to hear more. Said up front they can’t sign anything.",
   checks: [false, true, true], signals: [false, false, false, false], counts: false,
   why: "Nice chat, wrong person. Your checklist says founders and CTOs, so this one’s on us.",
  },
  {
   who: "Founder", where: "Small software agency",
   story: "Has exactly the problem you solve and agreed to a follow-up with your team. No budget until next year, though.",
   checks: [true, true, true], signals: [true, false, false, true], counts: true,
   why: "Two signals is the bar. A real need and a next step get it there, even before the budget opens.",
  },
  {
   who: "CTO", where: "B2B software company",
   story: "Booked a slot on your calendar, then didn’t turn up.",
   checks: [true, true, false], signals: [false, false, false, false], counts: false,
   why: "If they don’t show, it doesn’t count. We’ll try to rebook it once, and you still don’t pay for the miss.",
  },
 ],
 choices: { yes: "I’d pay for this", no: "I wouldn’t" },
 verdicts: { yes: "It counts. You pay for this one.", no: "It doesn’t count. You don’t pay." },
 feedback: { right: "You called it.", wrong: "Our rules say otherwise." },
 next: "Next call",
 finish: "See the month",
 summary: {
  lead: "calls you’d pay for",
  line: "The other calls cost you nothing. That’s the deal, every month.",
  again: "Try again",
  rules: "Read the full rules",
 },
 skip: "Skip to the answers",
 link: "Why BesideYou",
} as const;

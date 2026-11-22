// Copy for /how-it-works (v3.0, Pay Per Qualified Call).
// Source of truth: docs/besideyou-company-context.md and docs/website-build-brief-swaroop.md.
// Lines marked LOCKED must not be reworded. All other lines are drafts pending owner review.
// Rules: no prices, no em dashes, never call BesideYou an agency, no made-up numbers, no volume promises.

export const meta = {
 title: "How It Works: Cold Email, Pay Per Qualified Call | BesideYou",
 description: "How BesideYou works, step by step: we find your buyers through cold email, you keep the system, and you pay only when a qualified call actually happens.",
} as const;

export const intro = {
 label: "How it works",
 title: "What happens after you say yes.",
 // LOCKED bridge line.
 lead: "The system sits on your side of the desk, yours to keep, and you pay only when a qualified call actually happens.",
} as const;

export const stagesHead = {
 eyebrow: "The system",
 title: "From the right buyer to a call on your calendar.",
} as const;

// Five steps (owner's structure, 2026-11-16). Titles follow Subham's step names; the facts come
// from the company context (the docs describe four stages; "Engage" splits follow-ups and replies
// out of the old Reach and Hand-off).
export const stages = [
 {
  number: "01", name: "Plan",
  title: "We get to know your business.",
  body: "We spend 30 minutes on your offer, your market, the buyers you want and what you’re aiming for. Then you sign a short buyer checklist that says which buyers and which calls count, so we’re both counting the same way.",
  fromYou: "30 minutes and a signature.",
  fromUs: "Your buyer checklist, written up.",
 },
 {
  number: "02", name: "Build",
  title: "We build your list.",
  body: "We find the companies and people that fit, check every email address and look into each person. We also set up separate email addresses under your brand’s name and get them ready to send. Your main company email is never used.",
  fromYou: "Nothing to set up.",
  fromUs: "The list and the email addresses, ready to go.",
 },
 {
  number: "03", name: "Send",
  title: "We write and send.",
  body: "Each buyer gets three short emails, and the first one opens with something true about them. They go to the people who actually decide, and we check every day that they land in inboxes, not spam.",
  fromYou: "A quick read and an OK on the emails.",
  fromUs: "Research, writing, sending and daily checks.",
 },
 {
  number: "04", name: "Reply",
  title: "We handle the replies.",
  body: "Follow-ups go out on time and every reply gets sorted as it comes in. If a buyer is interested, a real person on our team answers the same working day.",
  fromYou: "Nothing. Your inbox stays quiet.",
  fromUs: "Follow-ups, sorting and same-day answers.",
 },
 {
  number: "05", name: "Call",
  title: "You take the call.",
  body: "Interested buyers pick a time from your booking link and it shows up on your calendar. That’s the first moment you need to do anything.",
  fromYou: "Show up, and confirm the call within 48 hours.",
  fromUs: "A short WhatsApp note before every call, and a report each month.",
 },
] as const;

// Illustrative content for the stage vignettes (decorative, aria-hidden).
// Each card shows the artifact (the standard, the domains, the email, the sorted replies, the
// booked call), never a restatement of the step copy beside it.
export const vignettes = {
 target: {
  heading: "Buyer checklist",
  rows: [["Titles", "Founder · CEO"], ["Market", "Your target market"]],
  signals: ["Need", "Timing", "Money", "Next step"],
  lit: 2,
  rule: "2 of 4 needed",
  signed: "Signed by you",
 },
 build: {
  own: "yourbrand.com",
  ownStatus: "never used",
  lookalikes: ["tryyourbrand.com", "yourbrandhq.com"],
  lookalikeStatus: "getting ready",
  list: "Verified list",
  listStatus: "every email checked",
 },
 reach: {
  heading: "one buyer · three emails",
  line: "Saw your team opened a second office this year.",
  lineCaption: "opening line, email 1",
  emails: ["Email 1", "Email 2", "Email 3"],
 },
 engage: {
  heading: "replies",
  status: "sorted",
  replies: [
   { text: "“Not this quarter. Try us later.”", tag: "follow up later" },
   { text: "“Please take me off your list.”", tag: "removed" },
  ],
  interested: { text: "“Interested. Can we talk next week?”", tag: "interested" },
  person: "a person replies · same business day",
 },
 handoff: {
  heading: "your calendar",
  tag: "qualified",
  event: "Intro call",
  who: "Founder · from your list",
  brief: "brief",
  chip: "On your calendar",
 },
} as const;

export const setup = {
 eyebrow: "Setup",
 title: "Three weeks from yes to the first email.",
 weeks: [
  ["Week 1", "Your email addresses set up. A 30-minute call about your buyers."],
  ["Week 2", "Your list built. Your emails written, and you OK them."],
  ["Week 3", "The first emails go out."],
 ],
 note: "Before anything goes out, we check that your market has enough verified buyers in it. If it doesn’t, we’ll tell you straight and stop there.",
} as const;

export const qualified = {
 eyebrow: "What counts",
 title: "What counts as a qualified call.",
 definition: "A call that actually happens, with a buyer from your checklist, in your target market, who shows at least two of these four signs.",
 signals: [
  ["Need", "They have the problem you solve."],
  ["Timing", "They plan to act within about 90 days."],
  ["Money", "They can pay for it."],
  ["Next step", "They agree to a next step."],
 ],
 lit: 2,
 caption: "Two of the four are there, so this call counts.",
 rules: [
  ["You miss the call", "It still counts. So does cancelling with less than 24 hours’ notice."],
  ["The buyer doesn’t show", "It doesn’t count, and we rebook it once."],
  ["Confirming a call", "You confirm each call within 48 hours. If we don’t hear back, it counts as confirmed."],
 ],
} as const;

// The commercial terms (fees, first month, cap, term) are not published. They are walked through
// on the call. This section explains the model against the usual retainer instead.
export const terms = {
 eyebrow: "The model",
 title: "Pay Per Qualified Call.", // LOCKED offer name.
 compare: {
  label: "The usual monthly fee compared with BesideYou",
  topic: "Compared on",
  usual: "The usual monthly fee",
  ours: "BesideYou",
  rows: [
   ["You pay for", "Time and effort: emails sent, hours worked.", "Calls with the right buyer that actually happen."],
   ["Who keeps the system", "They do. It leaves when they do.", "You do, during the work and after it."],
   ["How the price is set", "The same fee every month, whatever happens.", "Set per call to fit your deal size and market. We agree it on the call."],
  ],
 },
} as const;

export const exclusions = {
 eyebrow: "Boundaries",
 title: "What we don’t do.",
 items: ["LinkedIn outreach", "Cold calling", "CRM setup", "Standalone lists", "Ads", "Content"],
 line: "We do cold email that ends in calls with the right buyers. That’s all we do.",
} as const;

export const faq = {
 eyebrow: "Questions",
 title: "Before you book.",
 items: [
  { question: "Do you send emails from my company address?", answer: "No. We set up separate email addresses under your brand’s name, so your main email is never at risk." },
  { question: "Who decides which calls count?", answer: "You do, in writing. The buyer checklist you sign names the job titles, the market and the signs to look for, and we only bill for calls that match it." },
  { question: "When do I see the price?", answer: "On the first call, before you sign anything." },
  { question: "What do I keep if I leave?", answer: "The list, the domains and the emails. It was always your system." },
 ],
} as const;

export const closing = {
 title: "Your system. Beside you.",
 cta: "Book a Strategy Call",
} as const;

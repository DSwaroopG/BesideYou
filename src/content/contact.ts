// Copy for /contact, the Book a call page (v3.0 brief: "a four-field brief form, not a booking link").
// The intro keeps the existing owner voice ("Bring your hard questions", "diligence"). All other
// lines are drafts pending owner review. Rules: no prices, no em dashes, no made-up numbers.
// "Within one working day" is the existing site promise for replying to a brief.

export const meta = {
 title: "Book a Strategy Call | BesideYou",
 description: "Send a short brief and book a strategy call with BesideYou. Bring your hard questions: the call is you doing diligence on us, not us pitching you.",
} as const;

export const intro = {
 title: "Book a strategy call.",
 lead: "Bring your hard questions. This call is you doing diligence on us, not us pitching you.",
} as const;

export const next = {
 label: "What happens next",
 steps: [
  "We read your brief.",
  "We reply within one working day to set a time.",
  "On the call, we look at your buyers, your market and the numbers.",
 ],
 emailLabel: "Prefer email?",
 email: "hello@besideyou.io",
} as const;

export const form = {
 labels: {
  name: "Your name",
  company: "Company",
  email: "Work email",
  current_outbound_state: "How do you find new clients today?",
 },
 hint: "A line or two is enough.",
 submit: "Book a Strategy Call",
 sending: "Sending",
 privacy: "We only use this to reply to you.",
 privacyLink: "Privacy",
 // Shown in place of the form, beside "What happens next", so it must not repeat those steps.
 success: "Got it. Your brief is with us. Watch your inbox for our reply.",
 failed: "We couldn’t send your brief. Please try again, or email",
 rateLimited: "Too many attempts from this connection. Please wait a few minutes, or email",
 errors: {
  required: "Please complete this field.",
  invalid: "Enter a valid work email.",
  too_long: "Please keep this shorter.",
 },
} as const;

// /contact/sent: shown after a brief is sent without JavaScript.
export const sent = {
 metaTitle: "Brief received | BesideYou",
 title: "Got it.",
 lead: "We’ll reply within one working day to set a time.",
 link: "While you wait, see how it works",
} as const;

// The guided brief (components/contact-experience.tsx): one question at a time, with a live card
// that shows the brief and an agenda that rewrites itself from the answers. It fills the same six
// contract keys: role and primary_growth_objective are now optional answers instead of empty
// strings, and current_outbound_state is built from the picked options plus an optional note.
// Agenda lines are templates; {company} is replaced with the visitor's company.
export const guided = {
 rail: ["You", "Today", "The call", "Invite", "Review"],
 you: {
  title: "Let’s start with you.",
  before: "Hi, I’m", middle: "from", after: ".",
  placeholders: { name: "your name", company: "your company" },
  roleLabel: "And your role is",
  roles: ["Founder", "Co-founder", "CEO", "Managing director", "Head of growth", "Something else"],
  roleOther: "Your role",
 },
 today: {
  title: "How do new clients find you today?",
  hint: "Pick everything that applies.",
  options: [
   ["referrals", "Referrals"],
   ["network", "My own network"],
   ["self", "We send cold email ourselves"],
   ["agency", "An agency does our outreach"],
   ["linkedin", "LinkedIn"],
   ["events", "Events and partners"],
   ["inbound", "Inbound from our website"],
  ],
  reactions: {
   referrals: "Referrals bring the best clients. They just don’t arrive on a schedule.",
   network: "A good network goes a long way. We’ll talk about the people outside it.",
   self: "Then you know how many hours it eats. We’ll look at where they go.",
   agency: "Worth asking what happens to the list and the domains if you leave.",
   linkedin: "We stick to email, and it sits fine next to LinkedIn.",
   events: "Great for warm intros. We’ll look at the months in between.",
   inbound: "Nice when it comes. We’ll talk about the buyers who never find you.",
  },
  noteLabel: "Anything else we should know?",
  notePlaceholder: "Optional. A line or two is plenty.",
 },
 goal: {
  title: "What would make the call worth your time?",
  hint: "Optional, but it helps us prepare.",
  options: [
   ["calls", "A steady flow of qualified calls"],
   ["referrals", "Relying less on referrals"],
   ["own", "Owning our own outreach system"],
   ["test", "Trying outreach before hiring a salesperson"],
   ["pricing", "Understanding the pricing"],
   ["fit", "Seeing if we’re a fit"],
  ],
  noteLabel: "Anything specific?",
  notePlaceholder: "Optional.",
 },
 invite: {
  title: "Where should we send the invite?",
  label: "Work email",
  placeholder: "you@company.com",
 },
 review: {
  title: "Here’s your brief.",
  lead: "Have a quick look, then send it over.",
  edit: "Edit",
  send: "Send my brief",
  sending: "Sending",
 },
 continue: "Continue",
 back: "Back",
 enter: "or press Enter",
 card: {
  title: "Your strategy call",
  with: "with BesideYou",
  rows: { who: "Who", today: "Finds clients through", goal: "Wants from the call", email: "Invite goes to" },
  agenda: "What we’ll cover",
  you: "Your time",
  us: "Bhubaneswar",
  reply: "We reply within one working day.",
 },
 agenda: {
  first: "How {company} wins clients today",
  second: {
   agency: "What an agency keeps when you leave, and what you’d keep with us",
   self: "Where your hours go now, and what you could hand over",
   referrals: "A steady second channel next to referrals",
   network: "A steady second channel next to referrals",
   linkedin: "Why we stick to email, and how it fits next to LinkedIn",
   events: "Reaching buyers who haven’t found you yet",
   inbound: "Reaching buyers who haven’t found you yet",
   none: "Where your next clients are most likely to come from",
  },
  third: {
   pricing: "The numbers for your market, before you sign anything",
   own: "What you’d own: the list, the email addresses and the emails",
   test: "Trying outreach before you hire a salesperson",
   calls: "What a qualified call means for {company}",
   referrals: "How a second channel takes the pressure off referrals",
   fit: "Whether we’re a fit, and we’ll say so if we’re not",
   none: "How Pay Per Qualified Call would work for {company}",
  },
  last: "Your questions. Bring the hard ones.",
 },
 done: {
  eyebrow: "Brief sent",
  stamp: "Received",
  title: "It’s with us, {name}.",
  lead: "We’ll read it properly and reply within one working day to set a time.",
  steps: [
   ["Brief received", "Just now"],
   ["We reply to set a time", "Within one working day"],
   ["Your strategy call", "Bring the hard questions"],
  ],
  play: "While you wait, try the call game",
  how: "See how it works",
 },
} as const;

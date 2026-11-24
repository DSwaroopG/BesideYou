// Copy for /solutions (new in the v3.0 navigation). Organised around outcomes, not software or
// features. Every solution maps to a deliverable that exists today (docs/besideyou-company-context.md):
// nothing advertised that is not operational. All lines are drafts pending owner review.
// Naming follows the brief's banned list: "Pipeline Intelligence" became "Outbound reporting" and
// "Lead Qualification" became "Buyer qualification". No AI claims (none in the company docs).
// Rules: no prices or commercial terms, no em dashes, never call BesideYou an agency, no made-up numbers.

export const meta = {
 title: "Solutions: Find Buyers, Book Sales Calls | BesideYou",
 description: "Everything we do to put sales calls on your calendar: finding buyers, checking fit, cold email, follow-ups, booking and a monthly report. Pay per call.",
} as const;

export const intro = {
 label: "Solutions",
 title: "The whole job, from finding your buyers to booking the call.",
 lead: "We find your buyers, write to them, follow up and put calls on your calendar. You pay only when a call with the right buyer actually happens.",
} as const;

// The six parts, in plain words (owner feedback 2026-11-21: too much text, some of it confusing).
// Each card shows a short name and one line; "how" and "you get" open on tap (components/solution-cards.tsx).
// Ids double as deep links from the footer and the homepage (/solutions#booking).
export const solutions = {
 eyebrow: "What you get",
 title: "Six things, done for you.",
 note: "They work as one, so you get all six together.",
 open: "How it works",
 gets: "You get",
 link: "See it step by step",
 items: [
  {
   id: "discovery", icon: "find", name: "Finding buyers",
   outcome: "We find the companies you want, and the people there who decide.",
   does: "We agree on your ideal buyer with you, then build a list of matching companies and people, with every email address checked.",
   deliverable: "A checked list of buyers",
  },
  {
   id: "qualification", icon: "check", name: "Checking they fit",
   outcome: "You only get calls with buyers you’d actually want.",
   does: "You sign a one-page buyer checklist: which job titles, which market and which signs count. A call that doesn’t match it doesn’t count.",
   deliverable: "Your buyer checklist",
  },
  {
   id: "outreach", icon: "write", name: "Writing to them",
   outcome: "Short emails that sound like you wrote them yourself.",
   does: "We look into each buyer and write three short emails. They go out from separate email addresses under your brand’s name, so your main email stays safe.",
   deliverable: "Emails you OK before they go",
  },
  {
   id: "follow-up", icon: "reply", name: "Following up",
   outcome: "Nobody gets forgotten, and every reply gets an answer.",
   does: "Follow-ups go out on time without anyone having to remember. When someone replies with interest, a real person on our team answers the same working day.",
   deliverable: "Same-day replies",
  },
  {
   id: "booking", icon: "calendar", name: "Booking the call",
   outcome: "Calls land on your calendar, with a note on who you’re meeting.",
   does: "Interested buyers pick a time from your booking link. Before each call we send you a short WhatsApp note about the person you’re about to talk to.",
   deliverable: "Calls on your calendar",
  },
  {
   id: "reporting", icon: "report", name: "Monthly report",
   outcome: "One simple report each month on what happened.",
   does: "Once a month you get a short report: what went out, who replied, and which calls came of it.",
   deliverable: "A monthly report",
  },
 ],
} as const;

// "See the first email" (components/first-email.tsx). The visitor picks the kind of firm they run,
// the buyer, and something that just changed at the buyer's company; the card shows how the first
// email would open, with three notes on why it's written that way. Every email is an example:
// invented names and companies, the visitor's firm as the sender. Draft copy for owner review.
// The notes only repeat what the site already says about outreach (opens with something true about
// them, short, approved before sending).
export const firstEmail = {
 eyebrow: "Try it",
 title: "See the first email.",
 lead: "Pick who you are, who you sell to and what just changed for them. This is roughly how the first email would open, and why.",
 pickers: { firm: "You are", buyer: "You’re writing to", trigger: "What just happened at their company" },
 from: "From", to: "To", subject: "Subject",
 sender: "you@tryyourbrand.com",
 signName: "Your name",
 signFirm: "Your company",
 notes: [
  "Opens with something true about them, not about you.",
  "One line on what you do, in terms of their problem.",
  "Asks one easy question they can answer in a line.",
 ],
 footnote: "You approve every email before anything is sent.",
 firms: [
  {
   id: "ai", label: "AI and data team", name: "Maya", company: "a logistics company", ask: "Open to a short call next week?",
   buyers: ["CTO", "Head of Data"],
   triggers: [
    { id: "hire", label: "Hiring their first data engineer", subject: "Your first data hire", opener: "Saw you’re hiring your first data engineer.", bridge: "That first hire often spends months cleaning up the data setup before they get to the work they were hired for. We build that groundwork, so they start on the good part." },
    { id: "raise", label: "Just raised a round", subject: "After the raise", opener: "Congrats on the raise.", bridge: "More customers usually means more data than the current setup was built for. We help teams get ahead of that before it slows the product down." },
    { id: "sheets", label: "Still reporting from spreadsheets", subject: "The weekly spreadsheet", opener: "Your job post mentions a weekly report someone builds by hand.", bridge: "We move reports like that onto a proper data setup, without breaking the ones people already rely on." },
   ],
  },
  {
   id: "studio", label: "Software studio", name: "Daniel", company: "a fintech startup", ask: "Worth a quick chat to see if it fits?",
   buyers: ["Founder", "Head of Product"],
   triggers: [
    { id: "app", label: "A mobile app on the roadmap", subject: "The mobile app", opener: "Noticed a mobile app is on your roadmap this year.", bridge: "We design and build apps for product teams who’d rather not hire a whole mobile team for one launch." },
    { id: "roles", label: "Engineering roles open for months", subject: "The open engineering roles", opener: "Your engineering roles have been open for a while now.", bridge: "While you keep hiring, we can take a clear piece of the roadmap off your plate and hand it back finished." },
    { id: "launch", label: "Just launched a new product", subject: "The launch", opener: "Saw the launch. Congrats, it looks great.", bridge: "The weeks after a launch fill up with fixes and requests. We help teams keep shipping without wearing out the people who built it." },
   ],
  },
  {
   id: "it", label: "Managed IT provider", name: "Grace", company: "a group of dental clinics", ask: "Would a short call be useful?",
   buyers: ["Owner", "Practice manager"],
   triggers: [
    { id: "site", label: "Just opened a new location", subject: "The new clinic", opener: "Congrats on opening the new clinic.", bridge: "New sites are where IT tends to get patched together. We look after IT for clinics, so a new location works like the others from the first day." },
    { id: "switch", label: "Moving to new practice software", subject: "The software switch", opener: "Heard you’re moving to new practice software.", bridge: "Switches like that are where records and logins go missing. We run them for clinics, so the front desk barely notices." },
    { id: "hire", label: "Hiring their first IT person", subject: "Your IT hire", opener: "Saw you’re hiring your first IT person.", bridge: "Before you do, it might be worth comparing that with a team that covers the whole practice, holidays included." },
   ],
  },
  {
   id: "b2b", label: "B2B service firm", name: "Arjun", company: "an engineering consultancy", ask: "Worth a short call?",
   buyers: ["Founder", "Managing director"],
   triggers: [
    { id: "region", label: "Opening in a new region", subject: "The new office", opener: "Saw you’re opening an office in a new region.", bridge: "New regions come with new safety rules. We handle compliance for engineering firms, so the new office is covered from its first project." },
    { id: "bids", label: "Bidding on bigger projects", subject: "The bigger bids", opener: "Noticed you’re bidding on larger public projects now.", bridge: "Those bids ask for compliance paperwork smaller jobs never needed. We prepare it, so your team can focus on winning the work." },
    { id: "hire", label: "Hiring a compliance lead", subject: "Your compliance hire", opener: "Saw you’re hiring a compliance lead.", bridge: "While you search, we can cover that work for you. We already do it for engineering firms." },
   ],
  },
 ],
} as const;

export const offer = {
 eyebrow: "One offer",
 title: "Pay Per Qualified Call.", // LOCKED offer name.
 line: "You don’t pay for emails sent or hours worked. You pay only when a call with the right buyer actually happens.",
 link: "Why it works this way",
} as const;

export const who = {
 eyebrow: "Who it’s for",
 title: "Founder-led B2B firms where the founder still sells.",
 line: "These are the markets we started with. If you run a founder-led B2B firm and you still do the selling, we should talk.",
 link: "See who we help",
} as const;

export const provide = {
 eyebrow: "Your part",
 title: "You do very little.",
 items: [
  "A 30-minute call about your buyers.",
  "Sign your buyer checklist.",
  "OK the emails before they go out.",
  "Take the calls, and confirm each one within 48 hours.",
 ],
} as const;

export const keep = {
 eyebrow: "Yours to keep",
 title: "Everything we build stays yours.",
 line: "The list of buyers, the email addresses and the emails stay with you, even if you leave.",
} as const;

export const closing = {
 title: "Want to see what yours would look like?",
 cta: "Book a Strategy Call",
} as const;

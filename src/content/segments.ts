export const segments = [
  {
    "slug": "ai-consulting-firms",
    "headline": "Outbound for AI and ML consulting firms in India",
    "title": "Outbound Sales and B2B Lead Generation for AI Consulting Firms in India | BesideYou",
    "opening": "BesideYou builds and runs cold email outbound for AI and ML consulting firms in India with five to thirty people. We build the target list from the clients you have already won, write one sequence per account, send from lookalike domains we own rather than yours, and hand you replies with full context within two hours. The Pilot runs sixty days and commits to three qualified conversations, or your money back.",
    "whatWeDo": [
      "Your best clients usually came from someone who already trusted you. We start there. We look at the last handful of projects you won, what those companies had in common, and what stage they were at when they decided they needed outside help.",
      "Then we write to companies that match that pattern. One sequence per account, referencing the specific problem we think they have rather than describing what you do.",
      "Sending happens from lookalike domains we own and warm. Replies come back to us, get read within two hours, and reach you with enough context that you can answer as an engineer rather than as a salesperson."
    ]
  },
  {
    "slug": "saas-development-companies",
    "headline": "Outbound for SaaS development companies in India",
    "title": "Outbound Sales and B2B Lead Generation for SaaS Development Companies in India | BesideYou",
    "opening": "BesideYou builds and runs cold email outbound for SaaS development shops in India with five to thirty people. Most of these firms grew on referrals and stall when the network runs out. We rebuild the pipeline from your existing client pattern, write one sequence per account, protect your company domain by sending from lookalike domains we own, and brief you before you take a conversation over.",
    "whatWeDo": [
      "Referral pipelines fail quietly. There is no bad month, just a slow one, then another. The first thing we do is work out what your referred clients had in common, because that pattern is your target list and it is usually more specific than you expect.",
      "We write one sequence per account. For dev shops that usually means naming the product problem rather than the service, because founders buy a fix for a roadmap they are behind on.",
      "Your own domain is never used. We register and warm lookalikes, so the address your team uses every day stays clean regardless of how the campaign performs."
    ]
  },
  {
    "slug": "data-engineering-firms",
    "headline": "Outbound for data engineering firms in India",
    "title": "Outbound Sales and B2B Lead Generation for Data Engineering Firms in India | BesideYou",
    "opening": "BesideYou builds and runs cold email outbound for data engineering firms in India with five to thirty people. Your buyers exist and have budget, but they rarely hear from you. We find the companies that match the clients you have already delivered for, write one sequence per account, and hand over live replies within two hours with the context you need to respond.",
    "whatWeDo": [
      "Data teams get bought by people who already know they have a problem and have not found anyone to fix it. That makes targeting matter more than volume. We start from the pipelines you have already delivered and find companies at the same stage.",
      "One sequence per account, written around the symptom rather than the stack. Nobody goes looking for a vendor because they want a warehouse. They go looking because reporting is late.",
      "We send from lookalike domains we own, read every reply within two hours, and hand you the ones worth answering with the full thread and the context behind it."
    ]
  },
  {
    "slug": "dev-consultancies",
    "headline": "Outbound for dev consultancies in India",
    "title": "Outbound Sales and B2B Lead Generation for Dev Consultancies in India | BesideYou",
    "opening": "BesideYou builds and runs cold email outbound for development consultancies in India with five to thirty people. Utilisation is the whole business, and outbound is what keeps it steady between projects. We build the list from your won work, write one sequence per account, send from domains we own so yours stays clean, and hand you qualified conversations rather than raw leads.",
    "whatWeDo": [
      "Utilisation is the number that matters, and it moves before you see it. We build the target list from the engagements you have already staffed, because companies that hired you once look like the ones who will.",
      "One sequence per account, written around the capacity gap rather than the skill list. The buyer is usually someone who is short an engineer this quarter, not someone shopping for a long-term partner.",
      "Sending runs on lookalike domains we own and warm. Replies are read within two hours and briefed to you so you can quote quickly, which in this business is most of the advantage."
    ]
  },
  {
    "slug": "bengaluru",
    "headline": "Outbound sales for technical firms in Bengaluru",
    "title": "B2B Lead Generation and Outbound Sales in Bengaluru | BesideYou",
    "opening": "BesideYou runs cold email outbound for founder-led technical services firms in Bengaluru with five to thirty people. In a market this crowded, narrow targeting matters more than volume, so the list comes from the clients you have already won rather than a database pull, and each account gets its own sequence. Sending runs on lookalike domains we own. The Pilot runs sixty days and commits to three qualified conversations, or your money back.",
    "whatWeDo": [
      "Bengaluru has the deepest concentration of technical services firms in India, which means your buyers are close and your competitors are closer. Targeting has to be narrower here than anywhere else.",
      "We build the list from clients you have already won, then filter to companies in the city and its immediate corridor. One sequence per account, written to a specific company rather than to a segment.",
      "Sending runs from lookalike domains we own, so a crowded market does not put your own domain at risk. Replies are read within two hours and handed to you with the full thread."
    ]
  },
  {
    "slug": "mumbai",
    "headline": "Outbound sales for technical firms in Mumbai",
    "title": "B2B Lead Generation and Outbound Sales in Mumbai | BesideYou",
    "opening": "BesideYou runs cold email outbound for founder-led technical services firms in Mumbai with five to thirty people. Buyers here sit on the commercial side more often than the technical one, so the message is written for a reader who will not be moved by your stack. Each account gets its own sequence, sent from lookalike domains we own rather than yours. The Pilot runs sixty days and commits to three qualified conversations, or your money back.",
    "whatWeDo": [
      "Mumbai buyers sit on the business side more often than the engineering side, so the message has to survive a reader who does not care about your stack. That changes how we write, not who we target.",
      "We start from the clients you have already won and find companies in Mumbai that match the pattern. One sequence per account, framed around the commercial outcome rather than the implementation.",
      "Sending runs from lookalike domains we own and warm. Replies are read within two hours and reach you with enough context to answer the same day."
    ]
  }
] as const;
export type Segment = (typeof segments)[number];

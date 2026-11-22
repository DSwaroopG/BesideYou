// Case studies: the structure is ready, the list is empty on purpose. Never fabricate results to
// fill this. Add an entry only for a real client, with their written permission to be named, and
// copy every number from that client's own monthly report. The section stays hidden (renders
// nothing) while the list is empty, on /why-besideyou and on the homepage.

export type CaseStudy = {
 /** Anchor id, e.g. "acme-data". */
 id: string;
 /** Client name, used only with written permission. */
 client: string;
 /** Their customer type and market, e.g. "AI and data team · India". */
 market: string;
 /** The client's starting situation. */
 startingPoint: string;
 /** What BesideYou implemented. */
 implemented: string;
 /** Campaign duration, e.g. "Three months of sending". */
 duration: string;
 /** Qualified calls generated, copied exactly from the client's report. */
 qualifiedCalls: string;
 /** Other measurable improvements, each one verifiable. */
 improvements: readonly string[];
};

export const caseStudiesHead = {
 eyebrow: "Case studies",
 title: "What happened when we built it.",
 note: "Every number comes from the client’s own monthly report.",
 labels: {
  startingPoint: "Starting point",
  implemented: "What we built",
  duration: "How long it ran",
  qualifiedCalls: "Qualified calls",
  improvements: "Also measured",
 },
} as const;

export const caseStudies: readonly CaseStudy[] = [];

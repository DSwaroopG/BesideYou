# BesideYou website handoff

Snapshot: 9 November 2026, Asia/Calcutta. This handoff describes the local files shipped in the ZIP, including work not committed to Git. README.md contains installation, prerequisites, start/build commands, safe testing, and troubleshooting.

## Purpose and product

We are building and refining BesideYou's marketing website for outbound infrastructure for founder-led technical teams. It explains the offer, identifies suitable businesses, describes the process, and leads visitors to book a session. The central offer is a 60-day Pilot: three qualified conversations with decision-makers matching the ICP, or money back in cash. Preserve approved commercial copy; claims need owner review before publication.

## How it is implemented

Next.js 16.2.6 App Router, React 19.2.4, TypeScript with strict checks, Tailwind CSS v4/PostCSS, plus custom CSS and client components for interactive motion. Most page output is statically prerendered at build time; booking is a server-side API route. Content data and reusable page components drive the six outbound segment pages. No database/CMS is required.

Instrument Sans and IBM Plex Mono use next/font/google. Original logo assets and OG image are in public/. Metadata, sitemap, robots, structured data and security headers are implemented in source. Canonical metadata uses https://besideyou.io; local previews retain that production identity. This package does not configure domain ownership, DNS or hosting.

## What has been done

The earlier light structural redesign established the site's content, shared layout, legal/contact pages, segment pages, responsive behavior, motion fallbacks and SEO. Round 2 refined the hero crosshair, entrance timings, sticky process cards, hover behavior, drawn rules and owner-supplied segment copy. Later fixes addressed contrast-section behavior and related layout details. Selected historical written reports are included for background, with their original dates/branch references left intact.

More recent work evolved the homepage into the current calmer editorial direction: animated hero, scroll-driven sixty-day difference section, process flow, animated comparison/options table, a closing section with rolling sixty/dot mascot/Pilot treatment, then a rebuilt header/navigation and ink footer.

The newest working changes replace the Pilot page with a flight-plan story. It has an opening flight strip, six flight phases from pre-flight through landing, a route visualization contrasting the Pilot with agency holding patterns, timed callouts and obligations/deliverables, two end outcomes, booking CTA and FAQ. /pilot redirects to /the-pilot. This is the active review area, not a fully signed-off release.

## Exact source checkpoint

Source repository: besideyou-main, branch redesign/calm, base HEAD bdd1eb6 (feat: rebuild site header nav and ink footer).
Recent preceding commits: df373fa (home closing), a1ae8a3 (home options), 135e37f (home difference).
The archive contains the working-tree snapshot, not just those commits. It includes uncommitted edits to globals/layout, Pilot, home hero/closing/options/sections, shared structure and audit tooling; new pilot-flight component/content and /pilot alias; and the removal of the superseded home-closing-content and home-closing-motion modules. README, this handoff and the portable smoke test were added for this transfer. No commits, push, PR or deployment were performed for the handoff. Git history is excluded; initialize a fresh repository on the new machine if desired.

## Code map

- src/app/page.tsx: homepage composition.
- src/app/globals.css: global tokens/layout and much of the homepage styling.
- src/components/home-hero.tsx, home-difference.tsx, home-flow.tsx, home-options* and home-closing.tsx: homepage sections and motion.
- src/components/structure.tsx and site-nav.tsx: shared header/footer/navigation.
- src/app/the-pilot/page.tsx and pilot.css: Pilot page composition/style.
- src/components/pilot-flight.tsx and src/content/pilot-flight.ts: flight interaction and timeline/copy data.
- src/components/session-entrance.tsx, section-rules.tsx and scroll-motion.tsx: shared progressive motion behavior.
- src/content/segments.ts and src/components/segment-page.tsx: six outbound pages.
- src/components/contact-form.tsx and src/app/api/book-session/route.ts: validation/form and live webhook forwarding.
- src/lib/metadata.ts, structured-data.tsx, app/robots.ts and app/sitemap.ts: search metadata.
- scripts/smoke-test.mjs: new portable route test; other scripts are historical specialized QA tools.

## Constraints and working rules

- AGENTS.md warns that this Next.js version has breaking changes. Before framework API edits, read the relevant installed documentation in node_modules/next/dist/docs/. CLAUDE.md points to AGENTS.md.
- Work locally; pushing, opening a PR or deploying needs a separate owner instruction. The old README named redesign/light-structural; the actual current branch is redesign/calm.
- Preserve the logo, established typefaces/design direction, approved copy and business offer unless the owner requests a change. Historical briefs restrict visible em dashes and the phrase 'lead generation'; treat those as inherited editorial constraints pending owner revision.
- Preserve the six booking payload keys and existing webhook contract. Completed form submission sends real data to the live service; use mocked success/error tests unless a live test is authorized. No booking was submitted during this handoff.
- Maintain mobile usability, keyboard access, readable static content, native disclosures, no horizontal overflow and reduced-motion behavior. Contact intentionally skips the entrance; older checks describe entrance on hard loads and silent client navigation.
- Historical QA acceptance values included Performance >=90, mobile LCP <2.5s, and complete segment-body shared phrase coverage <40%. Earlier reports document LCP and duplication failures; do not rewrite exact owner-approved copy just to satisfy a metric without agreement.
- allowedDevOrigins contains an old local IP. Adjust only if cross-device development requires it. CSP/security headers and production canonical domain assumptions are in next.config.ts and metadata code.
- The booking proxy currently forwards JSON without server-side schema validation/rate limiting. Assess abuse/error handling before a public launch; this transfer did not alter runtime behavior.
- No offline-first promise: npm dependencies and Google Fonts need network access on a fresh setup. No secrets/.env files or machine-specific dependencies are included.
- Legacy tests contain fixed Windows paths and assumptions about earlier markup/animations. Port and review those assertions before treating them as current acceptance tests.

## Validation performed for this transfer

- Production build passed using the existing installed dependencies, after enabling network access for Google Fonts. The first sandboxed build failed solely at font fetching.
- Standalone TypeScript no-emit check passed.
- Portable smoke test passed against local development: all 13 content routes returned 200 with one H1; /pilot redirected; robots and sitemap returned 200.
- No current full browser visual/accessibility audit, animation timing audit, Lighthouse rerun, clean-machine npm ci, live webhook test or deployment was performed. Earlier reports are historical evidence, not certification of this working tree.
- ZIP manifest and archive checks are described in PACKAGE-VERIFICATION.txt alongside the archive.

## Next steps, in order

1. Extract on the destination machine, install Node, run npm ci, build, type-check, start and run the smoke test using README.md.
2. Review the homepage and /the-pilot together with the owner. Confirm the flight narrative, callout timing, typography, scroll lengths, mobile layout and final two outcomes. Gather explicit feedback before redesigning further.
3. Perform current browser QA at 375/768/1440px, keyboard and reduced-motion/no-JavaScript checks, route navigation/FAQ checks and mocked booking success/failure tests. Check hydration/console errors and scroll performance. Update older tests to current components and portable paths.
4. Re-run production mobile Lighthouse and segment-copy comparisons. Resolve measured issues while preserving approved content; record any tradeoffs or unresolved targets honestly.
5. After owner approval, commit the reviewed working changes and prepare hosting/runtime/domain configuration. Push, PR and deployment remain separate authorized actions.

## Scope of this archive

This is the website runtime source and website handoff. Separate D:/besideyou research-layer/n8n workflow experiments, external 3D pilot reference studies, other QA worktrees, and external source briefs are not runtime dependencies and are not bundled. Their full conversations are not available in this archive. For exact earlier acceptance details, consult the included historical reports and the owner; do not infer missing instructions from component names.

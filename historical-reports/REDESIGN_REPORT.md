# BesideYou redesign review

Implementation and verification complete. Local review only.

## 1. Branch and local commits

Branch: `redesign/light-structural`. Base `main` remains `9249889f096e698ff030e40c5539a3a67188eb60`. The pre-existing `fix/mobile-and-credibility` branch was preserved. Nothing was pushed and no pull request was opened.

```text
a8978eb feat: rebuild light structural foundation and site shell
ab71ca7 feat: add Pilot fit contact and legal pages
69d5249 feat: add six data-driven outbound pages
49f326c feat: complete static home and process layouts
9d9f3c7 feat: add five constrained motion behaviors with static fallbacks
eda3fc6 feat: add route metadata structured data and social assets
```

The phase-seven commit, `test: verify structural redesign and document owner review`, contains this report and its evidence. Its final hash is supplied in the task response. No commit is made to main.

## 2. Verification results

[Production build](phase-7-build.txt) passed. [TypeScript](tsc.txt) exited 0 with no diagnostics. All seven phase builds have their own saved transcripts.

| Route | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| / | 99 | 100 | 100 | 100 | 1.813s | 0 | 92ms |
| /outbound/ai-consulting-firms | 95 | 100 | 100 | 100 | 2.461s | 0 | 162ms |

These are production-build, simulated-mobile runs with the normal Lighthouse mobile settings, including 4× CPU slowdown and 150ms RTT. No reduced-motion setting, entrance skip, custom throttling or audit exclusions were used. [Home report](lighthouse-home.html), [AI consulting report](lighthouse-ai-consulting-firms.html), [raw metrics](lighthouse-summary.json). Earlier nonpassing results are retained as explicitly named earlier summaries.

- 13 page routes return 200 and have unique titles, descriptions, canonical URLs, social metadata and exactly one non-hidden H1 in server HTML.
- 91 route/width combinations checked: 320, 360, 375, 414, 768, 1024 and 1440px. No horizontal overflow. Mobile interactive targets meet 44×44px; form text is 16px and controls are at least 48px high.
- Thirteen routes checked with JavaScript disabled, and thirteen with reduced motion. Native FAQs open without JavaScript. All content remains server rendered; the entrance is absent from server HTML.
- Form checks cover the four required fields, malformed email, errors clearing on edits, pending state, exact six-key JSON including empty optional values, success, HTTP failure and network failure. Requests were intercepted locally: no booking reached the live webhook.
- M0 checked in fresh contexts with normal fonts, fonts that never become ready, rejected fonts, denied storage and direct contact entry. A thirteen-link client navigation tour and a same-session reload do not replay the entrance.
- The latest font-stall test removed the entrance in 1471ms from insertion, within the 1600ms maximum; normal removal was 862ms. Full measurements are in the production JSON.
- M1 has four phrases plus a hidden loop duplicate, an accessible static text alternative and a fixed clipped height. M2 settles at scale .95 / opacity .65 behind the next card. M3 stays within 60px total travel, with opposite-direction rates of 1 and 2/3. M4 has 1px decorative lines and pointer/touch support. Mobile disables M2/M3; reduced motion disables M0–M4.
- Sitemap contains eleven indexable routes. Legal placeholders are noindex. All page routes have incoming links; each segment links to a sibling, the Pilot and contact.
- Organization schema is global; the Pilot has six exact FAQ pairs; each segment has three exact FAQ pairs and breadcrumbs. Openings are 71, 66, 63, 62, 62, 62 words, respectively, all within 60–90.
- OG PNG returns 200 and is exactly 1200×630. Only Instrument Sans and IBM Plex Mono are requested by the site; fonts are locally served, preloaded and use swap.
- Source audit found no reused old CSS class names, visible banned phrase, em dash, unapproved number, gold text/border, dark theme or additional animation system. The logo and API route remain byte-for-byte identical to main.
- Calculated paper-background contrast: ink 17.47:1, accent 16.33:1, ink-70 8.38:1 and ink-45 6.33:1. On-gold text against gold: 8.25:1.

[Detailed production evidence](production-checks.json), [source audit](source-audit.json), [static baseline before M0](static-before-entrance.json).

## 3. Deviation log

1. Reused the already-cloned repository and installed dependencies, then branched from main, instead of creating a duplicate clone. This preserves the earlier remediation work and the owner's untracked patch.
2. Applied the explicitly approved form errors: “Please complete this field.”, “Enter a valid work email.” and “We could not send your message. Please try again or email hello@besideyou.io.” No additional business claim was introduced.
3. Applied the explicitly approved mobile 12px minimum to the 11px eyebrows and 10px TARGET label, resolving the brief's conflicting sizes.
4. Applied the explicitly approved contact exception: no entrance on direct contact entry or navigation into contact while the entrance is active.
5. Applied the explicitly approved comparison exception: gold selection with readable unselected columns, replacing 34% opacity. Clicking the selected option again clears selection; keyboard Space works too.
6. Used the first supplied sentence from each process step for home summaries. Used supplied text for metadata descriptions, and combined supplied Send/Hand-over sentences into the third shared “What we do” paragraph. This fills the requested summaries without inventing copy.
7. Used six minimal static route adapters around one data-driven template so each route exports metadata exactly as requested; no page body is duplicated.
8. Used existing headlines for sibling link labels and a circular sibling path through all six pages so Bengaluru and Mumbai have incoming links too.
9. Added a contact-page mailto link using the supplied email address, giving visitors another contact path, including when JavaScript is disabled.
10. Used the provided logo through Next's responsive image delivery and a 32px favicon rendition. The source file, colors and mark remain unchanged; this avoids an 86KB favicon download and oversized displayed images. No replacement logo asset was generated.
11. Refined M0 within Part 0's open timing allowance: 24ms letter staggering, 350ms transform, 250ms opacity, lift at 560ms over 280ms, total sequence 840ms. The longer timing was implicated in failed mobile LCP runs. The nine-letter offsets, fonts-ready gate, 600ms font fallback, session flag and two-stage motion are retained.
12. Scheduled the unconditional M0 removal at 1550ms, leaving 50ms for rendering before the 1600ms maximum. The initial exact-1600ms timer was observed removing the DOM about 9ms late.
13. Reserved a two-line rolling-phrase height on mobile to fit “data engineering teams.” at 320px without clipping text or shifting surrounding content.
14. Placed paper-backed hero text above the decorative crosshair so lines cannot reduce text legibility; added 60px containment space around desktop counter-scroll columns.
15. Used a static screen-reader text alternative for the rolling phrase instead of an invalid aria-label on an unroled span. All heading levels and visible copy are retained.
16. Expanded the mobile X link to a 44px target and explicitly set mono headings/captions to 400, correcting issues found during verification.
17. Used the supplied Common questions heading for the Pilot FAQ, added static ↗ directional glyphs, and used plain social-platform labels for the supplied social URLs. These introduce no claim or extra motion.
18. Replaced stale starter documentation, removed the prior remediation document and design-options HTML, and added reproducible QA scripts and this report. AGENTS.md, its CLAUDE.md reference, and the required framework/build scaffolding remain.
19. Used an isolated headless test browser for exact screenshots, JavaScript disabling, media emulation and fault injection because the in-app browser's full-page captures showed stitching artifacts and its interface did not expose those fault controls. The in-app browser was also used for visible DOM and form validation checks.
20. Kept the work entirely local under the explicit Git instructions, including the Sites skills' local-only exception. No Site was registered or published.
21. Enabled Next 16.2.6's documented experimental inlineCss option to remove a blocking first-visit stylesheet request. This trades independent stylesheet caching on full page loads for earlier rendering; client navigations retain Next's stylesheet handling. The existing CSP already permits these inline styles and was not widened.
22. Restricted Tailwind source detection to src, excluding saved Lighthouse HTML/JSON and other review artifacts from CSS generation. This prevents review files from adding unused styles to the product build. See [Tailwind's source detection documentation](https://tailwindcss.com/docs/detecting-classes-in-source-files).

## 4. Judgement calls left unchanged

- Kept the exact claim wording and supplied commercial commitments, including “under seven days,” “within two hours” and the sixty-day guarantee. No proof, metrics, clients, team, pricing or founder details were added.
- Kept the shared money-page body and supplied openings rather than inventing segment-specific claims or extending their copy for search.
- Kept the exact four-color system, prescribed fonts, light background, square borders, thirteen routes and page-specific motion assignments.
- Kept the legal pages as “Updating soon.” with noindex; no legal terms or policy was invented.
- Kept the logo artwork exactly as supplied even though its source PNG includes its own brand rendering, which is not constrained to the CSS color tokens.
- Kept the existing security header values, including X-Frame-Options SAMEORIGIN and CSP frame-ancestors none, although the latter is stricter. No CSP allowance was expanded.
- Kept the existing API route unchanged. Its live webhook remains an external dependency; these tests validate the frontend contract and mocked responses, not delivery by that live service.

## 5. Part B/C completion and remaining scope

All requested Part B pages and Part C technical items are implemented and verified. No requested implementation remains.

JSON form submission requires JavaScript. With JavaScript disabled, the form content and supplied email contact remain readable. This matches the requested readable-no-JavaScript requirement; a no-JavaScript JSON submission mechanism was not requested.

## 6. Screenshots

[Open the complete 26-image gallery](screenshots.html). Each image is a full-page production capture with the entrance settled. The process page is captured at the top so all four cards can be reviewed before they stack during scrolling.

| Page | 375px | 1440px |
|---|---|---|
| / | [Mobile](screenshots/home-375.png) | [Desktop](screenshots/home-1440.png) |
| /how-it-works | [Mobile](screenshots/how-it-works-375.png) | [Desktop](screenshots/how-it-works-1440.png) |
| /who-we-work-with | [Mobile](screenshots/who-we-work-with-375.png) | [Desktop](screenshots/who-we-work-with-1440.png) |
| /the-pilot | [Mobile](screenshots/the-pilot-375.png) | [Desktop](screenshots/the-pilot-1440.png) |
| /contact | [Mobile](screenshots/contact-375.png) | [Desktop](screenshots/contact-1440.png) |
| /privacy | [Mobile](screenshots/privacy-375.png) | [Desktop](screenshots/privacy-1440.png) |
| /terms | [Mobile](screenshots/terms-375.png) | [Desktop](screenshots/terms-1440.png) |
| /outbound/ai-consulting-firms | [Mobile](screenshots/outbound-ai-consulting-firms-375.png) | [Desktop](screenshots/outbound-ai-consulting-firms-1440.png) |
| /outbound/saas-development-companies | [Mobile](screenshots/outbound-saas-development-companies-375.png) | [Desktop](screenshots/outbound-saas-development-companies-1440.png) |
| /outbound/data-engineering-firms | [Mobile](screenshots/outbound-data-engineering-firms-375.png) | [Desktop](screenshots/outbound-data-engineering-firms-1440.png) |
| /outbound/dev-consultancies | [Mobile](screenshots/outbound-dev-consultancies-375.png) | [Desktop](screenshots/outbound-dev-consultancies-1440.png) |
| /outbound/bengaluru | [Mobile](screenshots/outbound-bengaluru-375.png) | [Desktop](screenshots/outbound-bengaluru-1440.png) |
| /outbound/mumbai | [Mobile](screenshots/outbound-mumbai-375.png) | [Desktop](screenshots/outbound-mumbai-1440.png) |

## 7. Files created or rewritten

All product code below is new. Existing route filenames and the CSS/layout filenames were replaced rather than ported. The original API route and logo are intentionally excluded from this created/rewritten list because they were not changed.

| File | Description |
|---|---|
| [next.config.ts](../next.config.ts) | Preserved security headers and allowedDevOrigins inside the typed exported config. |
| [public/og-image.png](../public/og-image.png) | 1200×630 typeset social image using the requested copy, colors and Instrument Sans. |
| [README.md](../README.md) | Run, build, verification and local-review instructions for the replacement site. |
| [reports/lighthouse-ai-consulting-firms.html](lighthouse-ai-consulting-firms.html) | Readable Lighthouse report for the AI consulting page. |
| [reports/lighthouse-ai-consulting-firms.json](lighthouse-ai-consulting-firms.json) | Machine-readable Lighthouse report for the AI consulting page. |
| [reports/lighthouse-favicon-summary.json](lighthouse-favicon-summary.json) | Earlier performance findings retained to explain the subsequent fixes. |
| [reports/lighthouse-home.html](lighthouse-home.html) | Readable Lighthouse report for home. |
| [reports/lighthouse-home.json](lighthouse-home.json) | Machine-readable Lighthouse report for home. |
| [reports/lighthouse-image-fix-summary.json](lighthouse-image-fix-summary.json) | Earlier performance findings retained to explain the subsequent fixes. |
| [reports/lighthouse-initial-summary.json](lighthouse-initial-summary.json) | Earlier performance findings retained to explain the subsequent fixes. |
| [reports/lighthouse-inline-css-summary.json](lighthouse-inline-css-summary.json) | Earlier performance findings retained to explain the subsequent fixes. |
| [reports/lighthouse-runs.txt](lighthouse-runs.txt) | Latest two-route Lighthouse console output. |
| [reports/lighthouse-short-entrance-summary.json](lighthouse-short-entrance-summary.json) | Earlier performance findings retained to explain the subsequent fixes. |
| [reports/lighthouse-summary.json](lighthouse-summary.json) | Latest two-route mobile audit summary. |
| [reports/phase-1-build.txt](phase-1-build.txt) | Saved successful production build output for phase-1. |
| [reports/phase-2-build.txt](phase-2-build.txt) | Saved successful production build output for phase-2. |
| [reports/phase-3-build.txt](phase-3-build.txt) | Saved successful production build output for phase-3. |
| [reports/phase-4-build.txt](phase-4-build.txt) | Saved successful production build output for phase-4. |
| [reports/phase-5-build.txt](phase-5-build.txt) | Saved successful production build output for phase-5. |
| [reports/phase-6-build.txt](phase-6-build.txt) | Saved successful production build output for phase-6. |
| [reports/phase-7-build.txt](phase-7-build.txt) | Saved successful production build output for phase-7. |
| [reports/production-checks.json](production-checks.json) | Detailed route, viewport, interaction and fault-injection results. |
| [reports/production-checks.txt](production-checks.txt) | Production verification console transcript. |
| [reports/production-interactions.txt](production-interactions.txt) | Interaction-check console transcript, including the prior resumed run. |
| [reports/REDESIGN_REPORT.md](REDESIGN_REPORT.md) | Owner review report, deviations, completion evidence and file inventory. |
| [reports/screenshots.html](screenshots.html) | Side-by-side gallery containing all thirteen routes at both requested widths. |
| [reports/screenshots/contact-1440.png](screenshots/contact-1440.png) | Full-page production screenshot: contact at 1440px. |
| [reports/screenshots/contact-375.png](screenshots/contact-375.png) | Full-page production screenshot: contact at 375px. |
| [reports/screenshots/home-1440.png](screenshots/home-1440.png) | Full-page production screenshot: home at 1440px. |
| [reports/screenshots/home-375.png](screenshots/home-375.png) | Full-page production screenshot: home at 375px. |
| [reports/screenshots/how-it-works-1440.png](screenshots/how-it-works-1440.png) | Full-page production screenshot: how-it-works at 1440px. |
| [reports/screenshots/how-it-works-375.png](screenshots/how-it-works-375.png) | Full-page production screenshot: how-it-works at 375px. |
| [reports/screenshots/outbound-ai-consulting-firms-1440.png](screenshots/outbound-ai-consulting-firms-1440.png) | Full-page production screenshot: outbound-ai-consulting-firms at 1440px. |
| [reports/screenshots/outbound-ai-consulting-firms-375.png](screenshots/outbound-ai-consulting-firms-375.png) | Full-page production screenshot: outbound-ai-consulting-firms at 375px. |
| [reports/screenshots/outbound-bengaluru-1440.png](screenshots/outbound-bengaluru-1440.png) | Full-page production screenshot: outbound-bengaluru at 1440px. |
| [reports/screenshots/outbound-bengaluru-375.png](screenshots/outbound-bengaluru-375.png) | Full-page production screenshot: outbound-bengaluru at 375px. |
| [reports/screenshots/outbound-data-engineering-firms-1440.png](screenshots/outbound-data-engineering-firms-1440.png) | Full-page production screenshot: outbound-data-engineering-firms at 1440px. |
| [reports/screenshots/outbound-data-engineering-firms-375.png](screenshots/outbound-data-engineering-firms-375.png) | Full-page production screenshot: outbound-data-engineering-firms at 375px. |
| [reports/screenshots/outbound-dev-consultancies-1440.png](screenshots/outbound-dev-consultancies-1440.png) | Full-page production screenshot: outbound-dev-consultancies at 1440px. |
| [reports/screenshots/outbound-dev-consultancies-375.png](screenshots/outbound-dev-consultancies-375.png) | Full-page production screenshot: outbound-dev-consultancies at 375px. |
| [reports/screenshots/outbound-mumbai-1440.png](screenshots/outbound-mumbai-1440.png) | Full-page production screenshot: outbound-mumbai at 1440px. |
| [reports/screenshots/outbound-mumbai-375.png](screenshots/outbound-mumbai-375.png) | Full-page production screenshot: outbound-mumbai at 375px. |
| [reports/screenshots/outbound-saas-development-companies-1440.png](screenshots/outbound-saas-development-companies-1440.png) | Full-page production screenshot: outbound-saas-development-companies at 1440px. |
| [reports/screenshots/outbound-saas-development-companies-375.png](screenshots/outbound-saas-development-companies-375.png) | Full-page production screenshot: outbound-saas-development-companies at 375px. |
| [reports/screenshots/privacy-1440.png](screenshots/privacy-1440.png) | Full-page production screenshot: privacy at 1440px. |
| [reports/screenshots/privacy-375.png](screenshots/privacy-375.png) | Full-page production screenshot: privacy at 375px. |
| [reports/screenshots/terms-1440.png](screenshots/terms-1440.png) | Full-page production screenshot: terms at 1440px. |
| [reports/screenshots/terms-375.png](screenshots/terms-375.png) | Full-page production screenshot: terms at 375px. |
| [reports/screenshots/the-pilot-1440.png](screenshots/the-pilot-1440.png) | Full-page production screenshot: the-pilot at 1440px. |
| [reports/screenshots/the-pilot-375.png](screenshots/the-pilot-375.png) | Full-page production screenshot: the-pilot at 375px. |
| [reports/screenshots/who-we-work-with-1440.png](screenshots/who-we-work-with-1440.png) | Full-page production screenshot: who-we-work-with at 1440px. |
| [reports/screenshots/who-we-work-with-375.png](screenshots/who-we-work-with-375.png) | Full-page production screenshot: who-we-work-with at 375px. |
| [reports/source-audit-console.txt](source-audit-console.txt) | Console transcript of the final source and exact-copy audit. |
| [reports/source-audit.json](source-audit.json) | Exact-copy, Git invariant, font, palette and calculated contrast evidence. |
| [reports/static-before-entrance.json](static-before-entrance.json) | Thirteen-page server-rendered baseline captured before implementing M0. |
| [reports/tsc.txt](tsc.txt) | TypeScript check command, exit status and any diagnostics. |
| [scripts/audit-source.cjs](../scripts/audit-source.cjs) | Brief-copy, source-style, contrast and unchanged Git asset/route assertions. |
| [scripts/generate-og.cjs](../scripts/generate-og.cjs) | Reproducible OG renderer using Next ImageResponse and Google Fonts TTF inputs. |
| [scripts/lighthouse-mobile.cjs](../scripts/lighthouse-mobile.cjs) | Two isolated mobile Lighthouse audits with the specified performance/LCP gates. |
| [scripts/verify-production.cjs](../scripts/verify-production.cjs) | Production route, viewport, screenshot, no-JS, reduced-motion and fault-injection checks. |
| [src/app/contact/page.tsx](../src/app/contact/page.tsx) | Contact introduction, email fallback and form placement. |
| [src/app/globals.css](../src/app/globals.css) | New palette, typography, responsive grid, native control styling and five motion styles. |
| [src/app/how-it-works/page.tsx](../src/app/how-it-works/page.tsx) | Process introduction and four scroll-stacking cards. |
| [src/app/layout.tsx](../src/app/layout.tsx) | Google Fonts, global shell, organization schema, entrance and favicon metadata. |
| [src/app/outbound/ai-consulting-firms/page.tsx](../src/app/outbound/ai-consulting-firms/page.tsx) | Thin static route adapter: selects segment data and exports its unique metadata. |
| [src/app/outbound/bengaluru/page.tsx](../src/app/outbound/bengaluru/page.tsx) | Thin static route adapter: selects segment data and exports its unique metadata. |
| [src/app/outbound/data-engineering-firms/page.tsx](../src/app/outbound/data-engineering-firms/page.tsx) | Thin static route adapter: selects segment data and exports its unique metadata. |
| [src/app/outbound/dev-consultancies/page.tsx](../src/app/outbound/dev-consultancies/page.tsx) | Thin static route adapter: selects segment data and exports its unique metadata. |
| [src/app/outbound/mumbai/page.tsx](../src/app/outbound/mumbai/page.tsx) | Thin static route adapter: selects segment data and exports its unique metadata. |
| [src/app/outbound/saas-development-companies/page.tsx](../src/app/outbound/saas-development-companies/page.tsx) | Thin static route adapter: selects segment data and exports its unique metadata. |
| [src/app/page.tsx](../src/app/page.tsx) | Home composition and exact home metadata. |
| [src/app/privacy/page.tsx](../src/app/privacy/page.tsx) | Noindex privacy placeholder with the supplied single line. |
| [src/app/robots.ts](../src/app/robots.ts) | Allows crawlers and points at the canonical sitemap. |
| [src/app/sitemap.ts](../src/app/sitemap.ts) | Lists eleven indexable routes and excludes legal placeholders. |
| [src/app/terms/page.tsx](../src/app/terms/page.tsx) | Noindex terms placeholder with the supplied single line. |
| [src/app/the-pilot/page.tsx](../src/app/the-pilot/page.tsx) | Guarantee, inclusion and input requirements, six FAQs and schema. |
| [src/app/who-we-work-with/page.tsx](../src/app/who-we-work-with/page.tsx) | Four company categories, destination links and supplied fit criteria. |
| [src/components/contact-form.tsx](../src/components/contact-form.tsx) | Six-key JSON form, inline validation, pending, success and failure states. |
| [src/components/hero-motion.tsx](../src/components/hero-motion.tsx) | M1 rolling phrase and M4 decorative mouse/touch crosshair. |
| [src/components/home-sections.tsx](../src/components/home-sections.tsx) | Home hero, contrast, process summary, comparison and closing sections. |
| [src/components/option-comparison.tsx](../src/components/option-comparison.tsx) | Keyboard-operable, toggleable gold comparison selection. |
| [src/components/questions.tsx](../src/components/questions.tsx) | Reusable native details/summary FAQ rendering. |
| [src/components/scroll-motion.tsx](../src/components/scroll-motion.tsx) | M2 and M3 scroll-position enhancement with mobile and reduced-motion fallbacks. |
| [src/components/segment-page.tsx](../src/components/segment-page.tsx) | Shared six-page outbound layout with FAQs, schema and sibling links. |
| [src/components/session-entrance.tsx](../src/components/session-entrance.tsx) | M0 client-only session entrance, font gate and independent hard cutoff. |
| [src/components/structure.tsx](../src/components/structure.tsx) | Header, four-block footer, CTA and asymmetric page introduction. |
| [src/components/structured-data.tsx](../src/components/structured-data.tsx) | Escaped Organization, FAQPage and BreadcrumbList JSON-LD. |
| [src/content/pilot.ts](../src/content/pilot.ts) | Verbatim guarantee, included work, input requirements and six FAQ pairs. |
| [src/content/process.ts](../src/content/process.ts) | Verbatim four process steps and supplied-sentence summaries. |
| [src/content/segments.ts](../src/content/segments.ts) | Verbatim headlines, SEO titles and 60–90-word openings for all six segments. |
| [src/lib/metadata.ts](../src/lib/metadata.ts) | Consistent unique route metadata, canonical URLs and shared social image references. |

Scratch helpers used outside the repository: D:/besideyou/create-segments.cjs (extract supplied segment copy), D:/besideyou/add-seo.cjs (create static metadata adapters), D:/besideyou/write-review.cjs (assemble this report/gallery), and D:/besideyou/og-fonts/regular.ttf plus medium.ttf (official Google Fonts source files for the OG renderer). These are not site dependencies.

## 8. Problems outside the requested implementation

- The pre-existing untracked `changes.patch` was preserved and is not included in redesign commits.
- The existing external webhook was not exercised with a real booking. No external message was sent.
- The unchanged API forwards request JSON without server-side field validation. The rebuilt form validates client inputs, but the route was preserved as explicitly required.
- Next's Google Fonts build step requires network access on a cold cache; the deployed/browser font requests remain same-origin and compatible with the preserved CSP.
- Verification was briefly delayed by automatic approval review rejecting an audit when account usage had run out. Once the tool reported a reset, the same authorized audit was resumed.

Stop after owner review delivery. Do not push.

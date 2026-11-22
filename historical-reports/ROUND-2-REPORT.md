# BesideYou Round 2 review

Eight requested fixes are implemented locally on `redesign/light-structural`. **Not all acceptance gates passed:** the final LCP medians exceed 2.5 seconds, and two complete money-page body comparisons exceed 40%. These are reported below rather than marked as passes. No push, PR, deployment, main-branch commit, or live booking submission was performed.

## Changes and commits

1. `8e6ad5f` Restore continuous crosshair guides and lift TARGET into a separate visible layer.
2. `125aea2` Replay entrance per page load, reset scroll, and give the settled wordmark a hold.
3. `6d49713` Use 260px cards, 40px spacing, 36px sticky steps and the softer covered state.
4. `d6657c5` Increase counter-scroll to 160px and approximately 107px, with 120px containment padding.
5. `ff3bed4` Add CTA, text-link, navigation, company-row, comparison and FAQ hover responses.
6. `d5760de` Add M5 rule drawing with no-JavaScript and reduced-motion fallbacks.
7. `e1f2a11` Insert six exact whatWeDo arrays, consolidate FAQ schema and apply the owner's replacement city openings.
8. The final local commit containing this report: `fix: refine layout and document round-two verification`. Its hash is in the delivery message. It includes the layout fixes and integration corrections found during QA.

## Verification

- All eight numbered builds passed. `npx tsc --noEmit` passed with no diagnostics. Logs are included.
- All 13 routes returned 200, retained one H1, and passed overflow checks at 375, 768 and 1440 pixels: 39 combinations.
- BesideYou is visible in the navigation at every tested width. Footer social links occupy one desktop row.
- Both guides span the entire hero, have 0.55 opacity and transparent headline backgrounds. TARGET remains inside the hero at five positions at each width: 15 checks. Corners were inset 1% from exact hit-testing boundaries.
- Refresh restarts the entrance and returns to scroll position zero, including contact. Client navigation remains silent. Contact never mounts the entrance.
- Final entrance uses the specified performance fallback: 34ms letter staggering, 420ms transform, 300ms opacity, lift at 900ms, 320ms exit, normal removal at 1220ms, unconditional removal at 1900ms. The settled hold is nominally 208ms, so the separate 250ms checklist target is superseded by the brief's explicit 200ms fallback.
- All 13 pages retain visible rules without JavaScript. All 13 pages have no running motion under reduced motion. M5 is once per route/load and never animates text. Rule setup waits until after load and two frames so it does not compete with initial content painting.
- Four distinct card edges are visible at desktop. Sticky offsets are 96/132/168/204px. An opaque backing avoids ghost text when card faces fade.
- Counter-scroll stayed inside its section at every sampled 100px scroll increment at 1024 and 1440 pixels.
- Actual hover changes passed for the gold CTA, text links, navigation, company rows, comparison columns and FAQ glyphs. Their transitions become zero under reduced motion. Four required form errors render at 15px on mobile.
- All six whatWeDo arrays exactly match the pasted brief. All openings remain between 60 and 90 words. Only `/the-pilot` has FAQPage JSON-LD. All outbound breadcrumbs remain.
- No visible em dash or banned phrase was found. Color tokens, both typefaces, the original logo, the API route and the six-key form implementation remain unchanged.
- Final functional evidence: `browser-checks.json` and `browser-checks.txt`. Earlier resume logs document test-harness corrections and are not the final verdict.

Measured final entrance durations from insertion to removal: /: 1257.3ms, /outbound/ai-consulting-firms: 1248.4ms. Blocked font readiness: 1861.8ms.

## Lighthouse

Standard Lighthouse mobile simulated throttling, 4x CPU, 150ms RTT, with fresh Chrome launches and the real entrance enabled. Three unchanged final-build runs are retained. The after values below are their medians; they are not selected best runs. No throttling reduction, entrance bypass, or audit exclusions were used.

| Page | Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Home | Before | 99 | 100 | 100 | 100 | 1.813s | 0.000000 | 92.0ms |
| Home | After median | 94 | 100 | 100 | 100 | 2.731s | 0.000000 | 201.0ms |
| AI consulting | Before | 95 | 100 | 100 | 100 | 2.461s | 0.000000 | 162.0ms |
| AI consulting | After median | 93 | 100 | 100 | 100 | 2.681s | 0.000000 | 223.0ms |

- `/` LCP range: 2.099 to 2.761s.
- `/outbound/ai-consulting-firms` LCP range: 2.017 to 2.809s.

The Performance >=90 gate passed in all three final runs on both pages. The LCP <2.5s gate did not pass consistently and both medians fail. The initial Fix 2 audit passed at 99/97 Performance and 1.897/2.367s LCP, before later fixes. After final layout changes, home measured 2.685s, triggering the mandated shorter entrance. Subsequent optimizations removed unused generated CSS and deferred decorative rule setup. They did not establish a reliable LCP pass. Full reports and intermediate summary files are retained; `lighthouse-median.json` is the consolidated final result.

## Duplication and the approved city update

The supplied replacement Bengaluru and Mumbai openings are inserted verbatim with ordinary paragraph whitespace, at 73 and 76 words. They still answer the page question in the first sentence. Everything else in their content data remains as supplied.

Using the same initial scope, openings plus whatWeDo, the city pair falls from **47.4% to 28.82%** shared phrase coverage. The stricter complete main-body comparison includes headings, the guarantee, the Pilot-answer link, and closing links. It yields **45.85% Bengaluru/Mumbai** and **43.67% AI/Mumbai**. The other 13 pairs are below 40%. Therefore the complete-body requirement remains unmet for two pairs despite the approved revision.

Method: lowercase word tokens, shared contiguous blocks of at least five words with Python SequenceMatcher and autojunk disabled, divided by the shorter body. Navigation/footer are excluded. This is a transparent operational comparison, not a search-engine scoring model. `duplication.json` contains all 15 pairs. Exact user copy takes priority over further unauthorized rewriting.

## Deviation log and judgement calls

1. Approved deviation: the two city openings replace the original ones with the owner's exact follow-up text. The seventh commit was amended to keep this content fix together.
2. The brief's required performance fallback supersedes the 300ms hold and 400ms exit. Final settled hold is approximately 208ms and exit 320ms. This also supersedes the checklist's 250ms hold requirement. The 1900ms failsafe is unchanged.
3. TARGET is a sibling of the crosshair layer, because a z-index:2 descendant cannot escape a parent's z-index:0 stacking context. Its position is clamped with 66px/26px reservations and uses 120ms left/top transitions to stay inside the hero at its edges.
4. An instance ref accompanies the module entrance guard so React's development effect replay does not leave a stuck overlay. It does not persist across hard refreshes.
5. Stack cards have a paper backing wrapper. Scaling/stickiness belong to that wrapper; the card face retains the requested covered opacity. This prevents transparent faces from exposing older text. Margin is on the wrapper so spacing is not doubled. This is an M2 rendering correction, not an extra motion behavior.
6. M5 enhances native borders with pseudo-elements. Native rules are visible before JavaScript, and the observer removes the pending class. Setup is deferred until load plus two frames after performance investigation; rule/text geometry does not change.
7. M5 applies to contact as the new site-wide instruction specifies; the original contact entrance exception remains. Short legal pages draw their header/footer separators and receive no invented sections.
8. Shared PageIntro leads start at column 1. Company rows use 4/8 while the fit criteria retain 5/7. Pilot sections alternate 5/7, 4/8 and full width. Repeated process cards retain one internal split because they are steps within one stack section. Home uses a two-column contrast, four-column process and three-column comparison, rather than arbitrary alternation inside repeated items.
9. Footer legal and social links use separate nowrap rows, stacked below 768px. The footer becomes a two-column grid at 768-1100px to avoid collisions. Header gaps/nav sizing are tightened at those widths; mobile mark is 32px and header CTA is 14px to keep both wordmark and CTA visible.
10. The standalone Pilot-answer sentence is a div following the full-width Pilot section, avoiding a consecutive full-width section split. Its inline link has a 44px minimum height.
11. Hover feedback extends to logo, email and footer links to satisfy the broad interaction checklist. Reduced-motion hover color/rule feedback can change instantly but animated transforms are disabled. There is no M6 content animation.
12. Tailwind source detection is now `source(none)`: all product classes are authored custom classes. This removes unused utilities generated from incidental component-code tokens. Tailwind v4 and its base styling remain; the critical CSS shrank from roughly 24.8KB to 22.9KB. Future utility classes must be explicitly registered.
13. A temporary mono-font preload trial failed to improve LCP and was reverted. A local font-variation probe showed limited savings; the original font files/loaders were retained. A build-only Brotli helper was installed under `D:/besideyou/qa-tools/python-deps`; no dependency was added to the app. Scratch font probes under `D:/besideyou` are not shipped.
14. The in-app preview was inspected. Isolated Chrome supplied exact screenshots, disabled-JavaScript/reduced-motion emulation and font-failure injection, following the existing QA approach. Early harness fixes distinguished CSS animation without JS from the stricter reduced-motion requirement, measured the header's bottom pseudo-element, and inset pointer corners for reliable hit testing.
15. The final commit also contains integration corrections and all review artifacts, keeping eight numbered local commits. Original Round 1 scripts/reports remain historical; README points to current checks.
16. LCP and the two duplication comparisons remain explicit exceptions. No passing status is claimed for them. The supplied city/commercial statements were not independently expanded or rewritten.

Judgements left alone: the shared guarantee and Pilot-answer sentence necessarily repeat; exact copy was preserved. The requested 260px cards retain breathing room instead of shrinking tightly around their text. The overlay still interrupts each hard refresh as requested, even though this has a performance cost. No legal copy, backend validation, pricing, proof, team or other out-of-scope content was added.

## Screenshots

[Open the gallery](screenshots.html).

- [Hero, pointer at centre](hero-centre.png)
- [Hero, pointer at lower-right corner](hero-bottom-right.png)
- [Process stack, first position](stack-1.png)
- [Process stack, second position](stack-2.png)
- [Process stack, four edges](stack-3.png)
- [Difference section, earlier scroll](difference-top.png)
- [Difference section, later scroll](difference-bottom.png)
- [AI consulting page, full length](money-page.png)

## Findings outside the prompt

The literal original opacity treatment caused older stack text to bleed through later cards; the backing wrapper corrects it. Development effect replay needed an instance guard after storage removal. Tailwind was generating unused utility declarations from incidental source tokens. Fresh-browser Lighthouse timings varied materially, so all three final runs and their ranges are retained. `changes.patch` was already untracked and remains untouched. Main still resolves to `9249889f096e698ff030e40c5539a3a67188eb60`; the booking API and logo have no diff from the Round 1 baseline.

The API was not exercised against its real external webhook. The form component itself has no Round 2 changes; mobile validation was checked locally. No new external side effects were introduced.

## Files changed

- `README.md`: Point to Round 2 evidence and current verification commands.
- `reports/lighthouse-ai-consulting-firms.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/lighthouse-ai-consulting-firms.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/lighthouse-home.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/lighthouse-home.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/lighthouse-summary.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/REPORT.md`: Complete Round 2 report, limitations and file inventory.
- `reports/round-2/before/lighthouse-summary.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/browser-checks-resume.txt`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/browser-checks.json`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/browser-checks.txt`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/browser-motion.txt`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/difference-bottom.png`: Production screenshot: Difference section, later scroll.
- `reports/round-2/difference-top.png`: Production screenshot: Difference section, earlier scroll.
- `reports/round-2/duplication.json`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/duplication.txt`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/final-lighthouse.txt`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/fix-1-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-2-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-2-lighthouse-summary.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/fix-2-lighthouse.txt`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/fix-3-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-4-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-5-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-6-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-7-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/fix-8-build.txt`: Successful production build log for the numbered fix.
- `reports/round-2/hero-bottom-right.png`: Production screenshot: Hero, pointer at lower-right corner.
- `reports/round-2/hero-centre.png`: Production screenshot: Hero, pointer at centre.
- `reports/round-2/hover-checks.json`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/hover-checks.txt`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/lighthouse-before-timing-fallback.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-font-preload-trial.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-median.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-1/lighthouse-ai-consulting-firms.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-1/lighthouse-ai-consulting-firms.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-1/lighthouse-home.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-1/lighthouse-home.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-1/lighthouse-summary.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-2.txt`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-2/lighthouse-ai-consulting-firms.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-2/lighthouse-ai-consulting-firms.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-2/lighthouse-home.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-2/lighthouse-home.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-2/lighthouse-summary.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-3.txt`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-3/lighthouse-ai-consulting-firms.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-3/lighthouse-ai-consulting-firms.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-3/lighthouse-home.html`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-3/lighthouse-home.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-run-3/lighthouse-summary.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-short-timing.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/lighthouse-unused-css.json`: Lighthouse audit evidence, summary or retained performance trial.
- `reports/round-2/money-page.png`: Production screenshot: AI consulting page, full length.
- `reports/round-2/screenshots.html`: Local gallery of the eight requested captures.
- `reports/round-2/source-checks.json`: Verification evidence or retained diagnostic transcript.
- `reports/round-2/stack-1.png`: Production screenshot: Process stack, first position.
- `reports/round-2/stack-2.png`: Production screenshot: Process stack, second position.
- `reports/round-2/stack-3.png`: Production screenshot: Process stack, four edges.
- `reports/round-2/tsc.txt`: Empty successful TypeScript diagnostics log.
- `scripts/check-round-2-copy.py`: Reproduce all fifteen phrase-overlap comparisons.
- `scripts/verify-round-2-entrance.cjs`: Offer a focused rerun of entrance and refresh checks.
- `scripts/verify-round-2-hover.cjs`: Check hover changes, reduced transitions and mobile errors.
- `scripts/verify-round-2.cjs`: Check routes, widths, motion, fallbacks, timing and screenshots.
- `src/app/globals.css`: Motion, hover, grid, guarantee, navigation, footer and error typography fixes.
- `src/app/how-it-works/page.tsx`: Add opaque backing wrappers for stacking card faces.
- `src/app/layout.tsx`: Mount the site-wide rule enhancement.
- `src/app/the-pilot/page.tsx`: Vary adjacent section splits.
- `src/app/who-we-work-with/page.tsx`: Use 4/8 company rows while retaining the 5/7 fit section.
- `src/components/hero-motion.tsx`: Move TARGET outside the behind-text crosshair layer.
- `src/components/home-sections.tsx`: Promote the home guarantee into its dedicated style.
- `src/components/scroll-motion.tsx`: Increase counter travel and implement readable backed card scaling.
- `src/components/section-rules.tsx`: Observe and draw rules once after initial painting, with static fallbacks.
- `src/components/segment-page.tsx`: Render unique copy, remove outbound FAQs, retain breadcrumbs and revise splits.
- `src/components/session-entrance.tsx`: Per-load replay, scroll reset, bounded timing and development guard.
- `src/components/structure.tsx`: Add the wordmark, move intro leads and group footer links.
- `src/content/segments.ts`: Store exact per-segment copy and approved city openings.

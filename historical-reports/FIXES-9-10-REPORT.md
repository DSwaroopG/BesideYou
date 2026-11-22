# Fixes 9 and 10

**Reduced-motion check: false.** The in-app browser exposed `matchMedia('(prefers-reduced-motion: reduce)').matches === false` at 1280px. Isolated Chrome also returned false at 1440px without a media override. The effective OS/browser preference is not suppressing motion in either tested browser. The true reduced-motion state was later emulated only in disposable test pages to verify fallback behavior.

## Diagnosis before editing

1. `.by-motion-contrast` exists on `/`.
2. Its `--travel` value changes continuously. Measured on the unmodified production site at 1440 x 900:

| Scroll Y | Travel | Left translation | Right translation | Handler writes so far |
|---:|---:|---:|---:|---:|
| 0 | 0.443758px | -0.443758px | 0.295839px | 1 |
| 400 | 42.056242px | -42.056242px | 28.037509px | 2 |
| 800 | 83.668726px | -83.668726px | 55.779178px | 3 |
| 1200 | 125.281209px | -125.281209px | 83.520848px | 4 |
| 1600 | 160.000000px | -160.000000px | 106.666720px | 5 |

3. Temporary console logging at the `--travel` write recorded the initial update and every requested scroll update. Stack traces point to the compiled ScrollMotion handler. The log exists only in the isolated diagnosis browser, not in shipped source.
4. Both computed transform matrices change. They are not stuck.
5. No overriding transform rule was found. The desktop/no-preference media condition matches, `data-motion` is true, and neither reduced motion nor an `!important` override suppresses these transforms. A zero CSS transition duration does not freeze values assigned on each animation frame.
6. The handler does not stop after mount. It already uses a passive scroll listener with requestAnimationFrame throttling. IntersectionObserver is used for M5 rules, not continuous counter-scroll.

**Cause found:** no runtime freeze was reproduced. The visual structure translated the headings along with their rows, leaving no stationary reference and creating persistent-looking misalignment. The previous progress calculation also tracked the padded inner wrapper rather than the outer section. This was a legibility problem in the tested desktop configuration. Below 768px the counter-scroll is intentionally disabled; the owner's earlier viewport is unknown.

## Implementation

Fix 9 retains the working continuous listener. The two headings now live outside their translated row groups. Only the four rows per column move. Progress uses the outer Difference section's top and height: zero at viewport entry and one when its bottom exits. Left travel is `progress * 120`, right travel is `travel * 0.666667`. The right-hand divider stays with the stationary heading/group.

The motion wrapper retains 120px block padding. Desktop heading-to-row spacing adds a 120px clearance to the existing 24px gap, preventing upward rows from crossing the heading. The headings remain fixed relative to the section, and scroll naturally with the document; no new sticky behavior was added.

Fix 10 extends the existing M5 observer to the home process row. Four heading pseudo-elements draw over 600ms, delayed by 0/120/240/360ms, with the requested easing and left origin. The observer removes the pending class once. Text opacity and transform remain 1 and none. Below 768px, under reduced motion, and without JavaScript, these four rules render full width immediately.

## Verification

- Both numbered production builds passed. `npx tsc --noEmit` passed with no diagnostics.
- The five Difference captures measure approximately 0/30/60/90/120px travel; heading document positions are identical across all five and level with one another.
- Both moving row groups stay within the section across 80px scroll samples at 768, 1024 and 1440px.
- The process rules have the correct 600ms duration and four staggered delays. At the natural intermediate measurement, their widths differ in sequence; all finish at full width. Scrolling away and back does not re-arm them.
- Reduced motion produces no running site animation. All four process rules remain full width without JS and on mobile. Both column groups stack below 768px without counter-scroll.
- No overflow, visible em dash or banned phrase was found. No text, claims, content data, color tokens, font choices, API code or original logo were changed. Numeric values introduced in CSS/JS are the requested motion timings and layout clearance, not visible claims.
- `git diff --check` passed. The pre-existing untracked `changes.patch` remains untouched.

## Lighthouse home page

The before row is the prior Round 2 three-run median. The after row is one fresh-browser run of this production build. The standard mobile simulated throttle, 4x CPU and real entrance were retained. This follow-up's Performance >=90 gate passes; the measured LCP also happens to be below 2.5s, but one run does not establish a long-term field percentile.

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Before, Round 2 median | 94 | 100 | 100 | 100 | 2.731s | 0 | 201ms |
| After | 98 | 100 | 100 | 100 | 1.958s | 0 | 119.5ms |

## Commits

1. `ec9665f` fix: anchor Difference headings above counter-scrolling rows
2. The local commit containing this report: `fix: stagger home process rules with static fallbacks`. Its hash is included in the delivery message.

No commit to main, push, PR or deployment was performed.

## Frames

[Open all eight frames](frames.html).

- [Difference 1: scroll 69px, travel 0.00px](difference-1.png)
- [Difference 2: scroll 465px, travel 29.98px](difference-2.png)
- [Difference 3: scroll 861px, travel 59.97px](difference-3.png)
- [Difference 4: scroll 1258px, travel 90.03px](difference-4.png)
- [Difference 5: scroll 1654px, travel 120.00px](difference-5.png)
- [Process rules: 0ms](process-1.png)
- [Process rules: 300ms](process-2.png)
- [Process rules: 1000ms](process-3.png)

## Deviations and small implementation decisions

- Logging intercepted the handler's style write in a disposable browser instead of inserting a temporary console statement into production source. This preserved the unmodified build during diagnosis; all five logged call sites are retained.
- The fixed headings use normal document flow, not viewport pinning. Extra desktop clearance keeps translated rows below them; the outer wrapper still uses the specified 120px padding.
- The owned-column divider moved to its stationary group so that only the four rows counter-scroll.
- The process row joins M5's existing observer but does not get its generic whole-section pseudo-element. This avoids introducing an extra fifth line. A mobile-first visit marks its already-visible rules as drawn, preventing a later resize from replaying them.
- Difference frames use a constant document-coordinate crop while the real scroll offset changes. The capture helper asserts that taking the image does not change scroll position. This keeps the headings visible for comparison even at entry/exit.
- Offscreen screenshot capture flattened an intermediate compositor state, so the final three process frames use the native CSS transitions paused at 0/300/1000ms after a real observer trigger and are captured in the viewport. No lines were painted or edited into images. Continuous live timing and no-replay were verified separately.
- Isolated Chrome supplies media/JS emulation, logging and exact animation captures; the in-app browser provides the effective preference check and owner preview. No OS motion setting was changed.
- The stale preview process was identified by its exact Next.js command and port, then restarted. PowerShell's Stop-Process failed; taskkill targeted only that verified PID.
- The Lighthouse helper is home-only and enforces this follow-up's >=90 Performance gate. It still reports LCP, CLS and TBT without altering their measurement. The prior money-page duplication issue is outside these two fixes and remains unchanged.

## Files changed

- `reports/fixes-9-10/REPORT.md`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/checks.json`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/checks.txt`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/diagnosis.json`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/diagnosis.txt`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/difference-1.png`: Requested visual frame.
- `reports/fixes-9-10/difference-2.png`: Requested visual frame.
- `reports/fixes-9-10/difference-3.png`: Requested visual frame.
- `reports/fixes-9-10/difference-4.png`: Requested visual frame.
- `reports/fixes-9-10/difference-5.png`: Requested visual frame.
- `reports/fixes-9-10/fix-10-build.txt`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/fix-9-build.txt`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/frames.html`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/lighthouse-home.html`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/lighthouse-home.json`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/lighthouse-summary.json`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/lighthouse.txt`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/process-1.png`: Requested visual frame.
- `reports/fixes-9-10/process-2.png`: Requested visual frame.
- `reports/fixes-9-10/process-3.png`: Requested visual frame.
- `reports/fixes-9-10/process-capture.json`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/process-capture.txt`: Review report, gallery or reproducible verification evidence.
- `reports/fixes-9-10/tsc.txt`: Review report, gallery or reproducible verification evidence.
- `scripts/capture-process-rules.cjs`: Capture faithful native transition timeline frames.
- `scripts/diagnose-contrast.cjs`: Capture unmodified travel, transforms and temporary handler logs.
- `scripts/lighthouse-fixes-9-10.cjs`: Run the requested mobile home audit.
- `scripts/verify-fixes-9-10.cjs`: Verify motion, containment, once-only rules and fallbacks.
- `src/app/globals.css`: Fixed group styling, safe row clearance and staggered process rules.
- `src/components/home-sections.tsx`: Separate fixed headings from translated row groups.
- `src/components/scroll-motion.tsx`: Calculate section-entry progress and 120px travel.
- `src/components/section-rules.tsx`: Extend the existing M5 observer to process-row rules.

# H5X implementation notes

The public website is hosted on GitHub Pages at https://faisaltabrez.github.io/H5X/. The five pages remain separate documents with project-relative links and assets.

## Interactions

Hover or keyboard-focus the six highlighted phrases for floating previews: H5X, build, compete, hunt, show up and A growing team. The team preview introduces the listed members without implying a fixed roster size. Click/tap pins a card. Escape, close or clicking outside dismisses it. On phones, previews use a bottom card. The original ASCII renderer supports drag, scatter/reassembly, pause and reduced motion. Sound is opt-in; light/dark theme choice persists locally.

All five pages have scroll-driven interactions within the current route. The page frame, menu and footer remain fixed. Scroll down/up, swipe vertically, or use Page Down/Page Up or arrow keys with the main content focused to navigate without changing pages. The home mark turns; Bug Hunt advances one research card; Hackathon and Events advance their record groups; Gallery advances individual photographs and synchronizes its thumbnail page. The previous/next rows and visible page counters are removed; gallery thumbnail selection remains available. Compact screens show two records per group. Overflowing content remains readable in an inner viewport before a fresh gesture advances it.

One same-direction gesture advances at most once; inertia cannot skip multiple groups or carry an inner reading scroll into the next record. An intentional opposite gesture bypasses the momentum lock and reverses an in-flight slide on its existing animation timeline. Incoming and outgoing layers move together, then the inactive layer is removed. Small opposite trackpad noise does not trigger a reversal. Scrolling never changes the page URL. Popups and photo dialogs keep their normal controls and scrolling. Motion can be paused on every page, persists locally, and respects the operating system's reduced-motion preference. Navigation continues to work when animation is disabled. Neighboring gallery photos are preloaded.

## Automatic records

The official CTFtime team ID is 438630. GitHub Actions refreshes the team API and annual result API on every main-branch push, manual dispatch, and the 15-minute schedule. A successful combined record supplies world/India standings, rating points, event titles, positions, points, dates, team counts and source links. Existing events are re-read to capture corrections and removals. Only actual rated seasons from 2026 onward are displayed.

The Pages build embeds a complete verified record and publishes the same record at ctftime.json. Open pages request that same-origin file every minute and on returning to the tab. Build configuration skips calls to the local-only API on GitHub Pages. The profile card, event grid, event log and CTFtime-backed highlights use the same record. Other achievements retain their public/member attribution.

If an upstream refresh fails, the saved record remains and the publication marks it as last verified. The status becomes stale if the latest successful check is over an hour old. Scheduled GitHub jobs can be delayed, so the site shows verification time rather than promising instantaneous updates.

The optional local Node server is retained for development and checks upstream every five minutes. Directly opening an HTML file is an offline snapshot. No Node server is required by visitors to the hosted GitHub Pages website.

## Workflow permissions

Pull-request validation has read-only repository access. The publishing build can save the verified data file. Only the deployment job receives pages:write and id-token:write. No extra secrets are used. Updates are serialized, and a concurrent main-branch change cannot be overwritten by a forced push.

## Validation

npm test verifies H5X-only filtering, changed/removed results, stable revisions, malformed data rejection and complete refresh failure behavior. npm run check:site checks all five generated pages, project-relative assets, H5X branding, valid embedded records and the SHIELD-photo exclusion. Browser checks cover hover, popup entry, pin/close/Escape, keyboard and touch navigation, simulated feed corrections, outage fallback and phone/desktop layouts.

Scroll gesture tests cover accumulated trackpad input, momentum locking, immediate reversal during cooldown, opposite-direction noise, transition cooldown, wheel units, inner reading boundaries and bounded content navigation. Browser validation covers wheel transitions, immediate Page Down/Page Up reversal, absence of both navigation/count rows, correct gallery image restoration, photo enlargement, pause during a transition, and a 390 × 844 phone layout. Phone touch-event handling is implemented; physical touchscreen gestures were not exercised by the desktop browser tools.

See NOTICE-H5X.md for upstream attribution. Source assets and gallery credit links remain included in this repository.

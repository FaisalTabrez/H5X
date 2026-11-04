# H5X implementation notes

The public website is hosted on GitHub Pages at https://faisaltabrez.github.io/H5X/. The five pages remain separate documents with project-relative links and assets.

## Interactions

Hover or keyboard-focus the six highlighted phrases for floating previews: H5X, build, compete, hunt, show up and A growing team. The team preview introduces the listed members without implying a fixed roster size. Click/tap pins a card. Escape, close or clicking outside dismisses it. On phones, previews use a bottom card. The original ASCII renderer supports drag, scatter/reassembly, pause and reduced motion. Sound is opt-in; light/dark theme choice persists locally.

## Automatic records

The official CTFtime team ID is 438630. GitHub Actions refreshes the team API and annual result API on every main-branch push, manual dispatch, and the 15-minute schedule. A successful combined record supplies world/India standings, rating points, event titles, positions, points, dates, team counts and source links. Existing events are re-read to capture corrections and removals. Only actual rated seasons from 2026 onward are displayed.

The Pages build embeds a complete verified record and publishes the same record at ctftime.json. Open pages request that same-origin file every minute and on returning to the tab. Build configuration skips calls to the local-only API on GitHub Pages. The profile card, event grid, event log and CTFtime-backed highlights use the same record. Other achievements retain their public/member attribution.

If an upstream refresh fails, the saved record remains and the publication marks it as last verified. The status becomes stale if the latest successful check is over an hour old. Scheduled GitHub jobs can be delayed, so the site shows verification time rather than promising instantaneous updates.

The optional local Node server is retained for development and checks upstream every five minutes. Directly opening an HTML file is an offline snapshot. No Node server is required by visitors to the hosted GitHub Pages website.

## Workflow permissions

Pull-request validation has read-only repository access. The publishing build can save the verified data file. Only the deployment job receives pages:write and id-token:write. No extra secrets are used. Updates are serialized, and a concurrent main-branch change cannot be overwritten by a forced push.

## Validation

npm test verifies H5X-only filtering, changed/removed results, stable revisions, malformed data rejection and complete refresh failure behavior. npm run check:site checks all five generated pages, project-relative assets, H5X branding, valid embedded records and the SHIELD-photo exclusion. Browser checks cover hover, popup entry, pin/close/Escape, keyboard and touch navigation, simulated feed corrections, outage fallback and phone/desktop layouts.

See NOTICE-H5X.md for upstream attribution. Source assets and gallery credit links remain included in this repository.

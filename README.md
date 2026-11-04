# H5X

[Visit the website](https://faisaltabrez.github.io/H5X/) · [CTFtime team 438630](https://ctftime.org/team/438630/) · [Deployment workflow](https://github.com/FaisalTabrez/H5X/actions/workflows/pages.yml)

H5X began in 2024 with hackathons and events, and formally expanded into CTFs and bug hunting in July 2026. A growing team of builders and security enthusiasts from Hyderabad, with members from CBIT and MGIT.

Five separate pages: **CTF TEAM**, **BUG HUNT**, **HACKATHON**, **EVENTS ATTENDED**, **GALLERY**. Interactive ASCII H5X mark, hover/focus previews, light/dark themes, optional sound and motion controls. The gallery contains seven photographs from Deccan CTF, z0d1ak Finals, CyberStrike and Team1, with links to the original posts. Photos are paginated in groups of three. Events Attended is a text-only list, sorted newest first, with undated meetups at the end.

Scrolling animates content within each page while the menu and footer remain fixed: turn the homepage logo, advance research or record groups, and browse gallery photographs. Visible controls, keyboard navigation, pause/resume and reduced-motion support remain available. See [interaction notes](README-H5X.md#interactions).

## Publishing and record updates

GitHub Pages is built and published by `.github/workflows/pages.yml` on changes to `main`, manual dispatch, and a schedule every 15 minutes (minutes 07, 22, 37 and 52 UTC). Pull requests run validation without publishing.

Each publishing run requests the official H5X standings and event results, validates the entire record, builds all five pages, and deploys them together. Existing event corrections and removals are included. Public/member-reported achievements remain separately credited.

Open pages recheck the site's `ctftime.json` every minute. The team-name card, competition overview, event log and official highlights all read that shared record. The site displays its last verification time and a stale status after an hour without fresh data. If CTFtime is unavailable, the workflow deploys the last verified record with an explicit status instead of mixing partial responses.

Changed records are saved to `data/ctftime-live.json`. A daily verification timestamp is also committed when records are unchanged. The workflow uses the repository's built-in token; no personal token or additional secret is required.

Scheduled runs can be delayed by GitHub; this is scheduled refresh, not an instantaneous push subscription. Run **Actions → Publish H5X and refresh CTFtime → Run workflow** for an immediate check.

## Vercel

Import this repository into Vercel with the **Other** preset and repository root. `vercel.json` declares the validated build command and `out` output directory. Main-branch pushes automatically redeploy the connected project.

Vercel serves the same scheduled record through `/records/ctftime.json`, a no-store rewrite to the GitHub Pages feed. The UI refreshes that record every minute, so the existing 15-minute GitHub Actions updater works on both hosts without a Vercel cron job or additional credentials. If the feed is unavailable, the validated build-time record remains visible with its verification time.

## Local development

Node.js 20 or newer; no dependencies need installing.

```sh
npm test
npm run sync:ctftime
npm run build
npm start
```

Open http://127.0.0.1:8766. Windows users can double-click `START-H5X.cmd`. The optional local Node server checks CTFtime every five minutes. To reproduce the GitHub Pages build, run `npm run build:pages` followed by `npm run check:site`.

Edit the team/site content in `src/pages/`, `src/shell.html`, `static/` and `data/h5x.json`. CTFtime records are maintained by the updater. Do not edit `out/`; it is generated and excluded from Git.

## Attribution

Adapted from [H7-Tex/TX](https://github.com/H7-Tex/TX), revision `8204b29`, including the original ASCII renderer, typography and synthesized interaction sounds. See [NOTICE-H5X.md](NOTICE-H5X.md) for provenance and [README-H5X.md](README-H5X.md) for interaction and validation notes.

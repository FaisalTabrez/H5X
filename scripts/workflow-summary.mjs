import {appendFile,readFile} from 'node:fs/promises';
const d=JSON.parse(await readFile('data/ctftime-live.json','utf8'));
const summary=`## H5X CTFtime refresh\n\n- Upstream check: ${process.env.REFRESH_OUTCOME}\n- Last verified: ${d.fetchedAt}\n- Official events: ${d.events.length}\n${d.seasons.map(s=>`- ${s.year}: #${s.world} worldwide / #${s.india??'—'} India`).join('\n')}\n\nSource: ${d.source}\n\nThe scheduled workflow runs at minutes 07, 22, 37 and 52 each hour (UTC).\n`;
await appendFile(process.env.GITHUB_STEP_SUMMARY,summary);

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fetchSnapshot,writeSnapshot} from './ctftime-feed.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{
 const data=await fetchSnapshot();
 await writeSnapshot(path.join(root,'data/ctftime-live.json'),data);
 console.log(`Verified H5X: ${data.events.length} events; ${data.seasons.map(s=>`${s.year}: #${s.world} world, #${s.india??'—'} India`).join('; ')}. ${data.fetchedAt}`);
}catch(error){console.error(`CTFtime refresh failed; previous verified snapshot retained: ${error.message}`);process.exitCode=1;}

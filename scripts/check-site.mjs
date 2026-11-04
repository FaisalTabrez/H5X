import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {validSnapshot} from './ctftime-feed.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'out');
for(const file of ['index.html','bug-hunt.html','hackathon.html','events.html','gallery.html']){
 const html=await readFile(path.join(out,file),'utf8');
 assert(!html.includes('{{'),'Unresolved template in '+file);
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 assert(!/h7tex\.com|team\/281844/.test(html),'Upstream identity in published HTML');
 for(const [,url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(https?:|data:)/.test(url))continue;
  assert(!url.startsWith('/'),'An absolute local asset path breaks project Pages');
  await access(path.resolve(out,url.split(/[?#]/)[0]));
 }
 const data=JSON.parse(html.match(/id="h5x-data"[^>]*>(.*?)<\/script>/s)[1]);assert(validSnapshot(data.ctftime));
 if(file==='events.html'){
  for(const event of data.events){
   const source=new URL(event[3]);assert.equal(source.protocol,'https:','Event sources must use HTTPS');
   if(source.hostname==='linkedin.com'||source.hostname.endsWith('.linkedin.com')){
    assert(/^\/(posts\/[^/]+|feed\/update\/urn:li:(activity|share):\d+)\/?$/.test(decodeURIComponent(source.pathname)),`Event ${event[1]} must link to a specific post, not a LinkedIn profile or search page`);
   }
  }
 }
}
const gallery=JSON.parse(await readFile(path.join(out,'gallery/credits.json'),'utf8'));
assert(!/shield/i.test(JSON.stringify(gallery)),'SHIELD photograph in gallery');
console.log('Five pages, project-relative assets, H5X identity, valid records and gallery exclusions verified.');

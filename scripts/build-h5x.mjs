// Local H5X adaptation of H7-Tex/TX. The live server refreshes the verified feed.
import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readSnapshot} from './ctftime-feed.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.resolve(ROOT,'out');
const pagesMode=process.argv.includes('--pages');
const feedConfig={mode:pagesMode?'pages':'local',refreshMinutes:pagesMode?15:5,ok:process.env.H5X_SYNC_OK!=='false'};
if(!OUT.startsWith(ROOT+path.sep)||path.basename(OUT)!=='out')throw Error('Unexpected build output path');
const pages=[['index.html','ctf','CTF TEAM'],['bug-hunt.html','bugs','BUG HUNT'],['hackathon.html','hackathon','HACKATHON'],['events.html','events','EVENTS ATTENDED'],['gallery.html','gallery','GALLERY']];
const data=JSON.parse(await readFile(path.join(ROOT,'data/h5x.json'),'utf8'));
data.ctftime=await readSnapshot(path.join(ROOT,'data/ctftime-live.json'));
if(!data.ctftime)throw Error('No verified CTFtime snapshot. Run npm run sync:ctftime first.');
const shell=await readFile(path.join(ROOT,'src/shell.html'),'utf8');
await rm(OUT,{recursive:true,force:true});
await mkdir(OUT,{recursive:true});
for(const folder of ['css','js','fonts','gallery'])await cp(path.join(ROOT,'static',folder),path.join(OUT,folder),{recursive:true});
// Embedded font URLs also preserve the typography when opened directly from disk.
let css=await readFile(path.join(OUT,'css/site.css'),'utf8');
for(const font of ['bricolage.woff2','fragment-mono.woff2']){
 const bytes=await readFile(path.join(ROOT,'static/fonts',font));
 css=css.replaceAll(`url(../fonts/${font})`,`url(data:font/woff2;base64,${bytes.toString('base64')})`);
}
await writeFile(path.join(OUT,'css/site.css'),css);
await cp(path.join(ROOT,'static/favicon.svg'),path.join(OUT,'favicon.svg'));
await writeFile(path.join(OUT,'ctftime.json'),JSON.stringify(pagesMode?{...feedConfig,data:data.ctftime}:data.ctftime));
for(const [filename,key,title] of pages){
 const content=await readFile(path.join(ROOT,'src/pages',key+'.html'),'utf8');
 const nav=pages.map(([file,id,label])=>`<a href="${file}"${id===key?' aria-current="page"':''}>${label}</a>`).join('');
 const html=shell.replaceAll('{{TITLE}}',title).replaceAll('{{PAGE}}',key).replace('{{NAV}}',nav).replace('{{CONTENT}}',content).replace('{{DATA}}',JSON.stringify(data).replaceAll('<','\\u003c')).replace('{{FEED_CONFIG}}',JSON.stringify(feedConfig));
 await writeFile(path.join(OUT,filename),html);
}
await writeFile(path.join(OUT,'robots.txt'),pagesMode?'User-agent: *\nAllow: /\n':'User-agent: *\nDisallow: /\n');
await writeFile(path.join(OUT,'.nojekyll'),'');
console.log('Built five H5X pages in '+OUT+' using the researched local snapshot.');

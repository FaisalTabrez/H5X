import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

export const TEAM_ID=438630;
export const REFRESH_MS=5*60*1000;
export function validSnapshot(data){
 return data?.schema===1&&data.teamId===TEAM_ID&&Number.isFinite(Date.parse(data.fetchedAt))&&Array.isArray(data.events)&&Array.isArray(data.seasons)&&data.events.every(e=>Number.isInteger(e.id)&&e.id>0&&typeof e.title==='string'&&Number.isInteger(e.place)&&e.place>0&&Number.isFinite(e.points));
}
export async function readSnapshot(file){try{const d=JSON.parse(await readFile(file,'utf8'));return validSnapshot(d)?d:null;}catch{return null;}}
export function normaliseFeed(team,yearResults,now=new Date()){
 if(team.id!==TEAM_ID||typeof team.name!=='string')throw Error('Unexpected CTFtime team response');
 const events=[];
 for(const [year,results] of Object.entries(yearResults)){
  if(!results||Array.isArray(results)||typeof results!=='object')throw Error('Unexpected CTFtime results response');
  for(const [id,event] of Object.entries(results)){
   if(!Array.isArray(event.scores)||typeof event.title!=='string')throw Error('Incomplete CTFtime event record');
   const score=event.scores.find(s=>Number(s.team_id)===TEAM_ID);
   if(!score)continue;
   if(!Number.isInteger(Number(score.place))||Number(score.place)<1||!Number.isFinite(Number(score.points)))throw Error('Invalid H5X result');
   const timestamp=Number(event.time);
   events.push({id:Number(id),title:event.title,year:Number(year),place:Number(score.place),points:Number(score.points),participants:event.scores.length,time:Number.isFinite(timestamp)?timestamp:null,url:`https://ctftime.org/event/${Number(id)}/`});
  }
 }
 events.sort((a,b)=>(a.time??0)-(b.time??0)||a.id-b.id);
 const seasons=Object.entries(team.rating??{}).filter(([year,r])=>Number(year)>=2026&&Number.isInteger(r?.rating_place)&&r.rating_place>0).map(([year,r])=>({year:Number(year),world:r.rating_place,india:Number.isInteger(r.country_place)&&r.country_place>0?r.country_place:null,points:Number(r.rating_points)||0,events:events.filter(e=>e.year===Number(year)).length})).sort((a,b)=>a.year-b.year);
 const content={schema:1,teamId:TEAM_ID,teamName:team.name,country:team.country,source:`https://ctftime.org/team/${TEAM_ID}/`,events,seasons};
 const data={...content,fetchedAt:now.toISOString(),revision:createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0,16)};
 if(!validSnapshot(data))throw Error('Invalid combined CTFtime snapshot');
 return data;
}
async function json(url,fetcher){
 const response=await fetcher(url,{headers:{'User-Agent':'H5X team website (team 438630)','Accept':'application/json'},signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw Error(`CTFtime returned HTTP ${response.status}`);
 return response.json();
}
export async function fetchSnapshot({fetcher=fetch,now=new Date()}={}){
 const team=await json(`https://ctftime.org/api/v1/teams/${TEAM_ID}/`,fetcher);
 const year=now.getUTCFullYear();
 const years=new Set([year,...Object.keys(team.rating??{}).map(Number).filter(y=>y>=2026&&y<=year&&team.rating[y]?.rating_place>0)]);
 const resultPairs=await Promise.all([...years].map(async y=>[y,await json(`https://ctftime.org/api/v1/results/${y}/`,fetcher)]));
 // No partial merge: rankings and every event are validated before replacing the feed.
 return normaliseFeed(team,Object.fromEntries(resultPairs),now);
}
export async function writeSnapshot(file,data){
 await mkdir(path.dirname(file),{recursive:true});
 const temp=file+'.tmp';await writeFile(temp,JSON.stringify(data,null,2)+'\n');await rename(temp,file);
}

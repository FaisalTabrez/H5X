import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchSnapshot,normaliseFeed,TEAM_ID} from '../scripts/ctftime-feed.mjs';
const team={id:TEAM_ID,name:'H5X',country:'IN',rating:{2025:{country_place:82},2026:{rating_place:136,country_place:12,rating_points:351.299}}};
const results={100:{title:'First CTF',time:1781312400,scores:[{team_id:TEAM_ID,place:5,points:'220.000'}]},200:{title:'Other team event',scores:[{team_id:7,place:1,points:'50'}]}};
test('only H5X results and real rated seasons are included',()=>{
 const d=normaliseFeed(team,{2026:results});assert.equal(d.events.length,1);assert.equal(d.events[0].place,5);assert.equal(d.events[0].url,'https://ctftime.org/event/100/');assert.equal(d.seasons.length,1);assert.equal(d.seasons[0].world,136);assert.equal(d.seasons[0].events,1);
});
test('revised placements, titles, points, ranks and deleted events replace the prior record',()=>{
 const old=normaliseFeed(team,{2026:results});
 const updated=normaliseFeed({...team,rating:{2026:{rating_place:99,country_place:8,rating_points:400}}},{2026:{100:{title:'Corrected CTF',scores:[{team_id:TEAM_ID,place:2,points:'270.5'}]},300:{title:'New CTF',scores:[{team_id:TEAM_ID,place:1,points:'10'}]}}});
 assert.notEqual(updated.revision,old.revision);assert.equal(updated.events[0].title,'Corrected CTF');assert.equal(updated.events[0].place,2);assert.equal(updated.events[0].points,270.5);assert.equal(updated.events.length,2);assert.equal(updated.seasons[0].world,99);
 const removed=normaliseFeed(team,{2026:{}});assert.equal(removed.events.length,0);
});
test('the record revision is stable when only the check time changes',()=>{
 const a=normaliseFeed(team,{2026:results},new Date('2026-11-01'));
 const b=normaliseFeed(team,{2026:results},new Date('2026-11-02'));
 assert.equal(a.revision,b.revision);assert.notEqual(a.fetchedAt,b.fetchedAt);
});
test('wrong team IDs and malformed result places are rejected',()=>{
 assert.throws(()=>normaliseFeed({...team,id:281844},{2026:results}),/Unexpected/);
 assert.throws(()=>normaliseFeed(team,{2026:{1:{title:'Broken result',scores:[{team_id:TEAM_ID,place:0,points:1}]}}}),/Invalid/);
});
test('a failed annual request rejects the entire refresh instead of mixing new ranks with old events',async()=>{
 const fetcher=async url=>url.includes('/teams/')?{ok:true,json:async()=>team}:{ok:false,status:503};
 await assert.rejects(fetchSnapshot({fetcher,now:new Date('2026-11-04')}),/HTTP 503/);
});

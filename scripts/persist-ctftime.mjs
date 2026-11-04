// Persist changed records, or a daily verification timestamp, using the workflow token.
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const run=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const fresh=JSON.parse(await readFile('data/ctftime-live.json','utf8'));
const previous=JSON.parse(run('show','HEAD:data/ctftime-live.json'));
if(fresh.revision===previous.revision&&Date.parse(fresh.fetchedAt)-Date.parse(previous.fetchedAt)<24*60*60*1000){console.log('No record change; daily verification already current.');process.exit(0);}
run('config','user.name','github-actions[bot]');
run('config','user.email','41898282+github-actions[bot]@users.noreply.github.com');
run('add','data/ctftime-live.json');
run('commit','-m',fresh.revision===previous.revision?'chore: verify H5X CTFtime record':'chore: update H5X CTFtime standings and results');
try{run('push','origin','HEAD:main');console.log('Verified record saved to main.');}catch{console.warn('::warning::Snapshot was built but not saved to main; the branch may have advanced. The next workflow will retry.');}

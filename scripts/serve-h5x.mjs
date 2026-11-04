import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fetchSnapshot,readSnapshot,writeSnapshot,REFRESH_MS} from './ctftime-feed.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'out');
const cacheFile=path.join(root,'data/ctftime-live.json');
let snapshot=await readSnapshot(cacheFile),inflight=null,lastAttempt=0,error=null;
async function refresh(){
 if(inflight)return inflight;
 lastAttempt=Date.now();
 inflight=(async()=>{try{const fresh=await fetchSnapshot();await writeSnapshot(cacheFile,fresh);await writeSnapshot(path.join(out,'ctftime.json'),fresh);snapshot=fresh;error=null;console.log(`CTFtime verified ${fresh.events.length} events at ${fresh.fetchedAt}`);}catch(e){error='CTFtime is temporarily unavailable';console.warn(error+'; retaining last verified record.');}finally{inflight=null;}})();
 return inflight;
}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/ctftime'){
   if(Date.now()-lastAttempt>=REFRESH_MS)await refresh();else if(inflight&&!snapshot)await inflight;
   res.writeHead(snapshot?200:503,{'Content-Type':'application/json','Cache-Control':'no-store'});
   res.end(JSON.stringify({mode:'live',ok:!error&&Boolean(snapshot),checkedAt:new Date(lastAttempt).toISOString(),refreshAfter:REFRESH_MS,data:snapshot,error}));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const file=path.resolve(out,'.'+pathname);
  if(!file.startsWith(out+path.sep)||(await stat(file)).isDirectory()){res.writeHead(404);res.end();return;}
  const content=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:content);
 }catch{res.writeHead(404);res.end('Not found');}
});
const port=Number(process.env.PORT)||8766;
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`H5X live preview: http://127.0.0.1:${port}`));
refresh();
const timer=setInterval(refresh,REFRESH_MS);timer.unref();
for(const event of ['SIGINT','SIGTERM'])process.on(event,()=>{clearInterval(timer);server.close(()=>process.exit(0));});

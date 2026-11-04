// One validated record drives every CTFtime count, event and ranking on the page.
(() => {
 const config=JSON.parse(document.querySelector('#h5x-feed-config')?.textContent||'{}');
 let record=D.ctftime,mode=location.protocol==='file:'?'snapshot':config.mode==='pages'?'pages':'snapshot',healthy=config.ok!==false,busy=false,endpoint=config.mode!=='pages';
 const valid=d=>d?.schema===1&&d.teamId===438630&&Array.isArray(d.events)&&Array.isArray(d.seasons)&&Number.isFinite(Date.parse(d.fetchedAt))&&d.events.every(e=>Number.isInteger(e.id)&&e.id>0&&typeof e.title==='string'&&Number.isInteger(e.place)&&e.place>0&&Number.isFinite(e.points));
 function notify(){document.dispatchEvent(new CustomEvent('h5x:ctftime',{detail:{data:record,mode,healthy}}));}
 function accept(data){if(!valid(data))throw Error('Invalid H5X record');record=data;D.ctftime=data;try{localStorage.setItem('h5x-ctftime',JSON.stringify(data));}catch{}notify();}
 const stamp=()=>record?new Date(record.fetchedAt).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})+' IST':'unavailable';
 const fresh=()=>mode==='snapshot'||Date.now()-Date.parse(record?.fetchedAt)<60*60*1000;
 window.H5XFeed={get:()=>record,status:()=>({mode,healthy:healthy&&fresh(),stamp:stamp(),refreshMinutes:config.refreshMinutes??5}),refresh};
 // Another open H5X tab can distribute a newer, complete snapshot immediately.
 addEventListener('storage',e=>{if(e.key==='h5x-ctftime'&&e.newValue){try{const d=JSON.parse(e.newValue);if(valid(d)&&Date.parse(d.fetchedAt)>Date.parse(record?.fetchedAt??0)){record=d;D.ctftime=d;notify();}}catch{}}});
 try{const cached=JSON.parse(localStorage.getItem('h5x-ctftime'));if(valid(cached)&&Date.parse(cached.fetchedAt)>Date.parse(record?.fetchedAt??0))record=D.ctftime=cached;}catch{}
 async function refresh(){
  if(busy||location.protocol==='file:')return;
  busy=true;
  try{
   if(endpoint){
    const response=await fetch('api/ctftime',{cache:'no-store',signal:AbortSignal.timeout(30000)});
    if(response.status===404){endpoint=false;}else{
     const payload=await response.json();if(payload.mode!=='live')throw Error('Unsupported feed');
     mode='live';healthy=payload.ok===true;
     if(payload.data)accept(payload.data);else throw Error('No verified CTFtime record');return;
    }
   }
   const response=await fetch(config.feedUrl||'ctftime.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('Snapshot unavailable');const payload=await response.json();
   if(payload.mode==='pages'){mode='pages';healthy=payload.ok===true;accept(payload.data);}else{mode='snapshot';healthy=true;accept(payload);}
  }catch{healthy=false;notify();}finally{busy=false;}
 }
 notify();refresh();
 setInterval(()=>{if(!document.hidden)refresh();},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();

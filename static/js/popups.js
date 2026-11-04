// Hover previews stay above the animated mark; click/tap pins one open.
(() => {
 const pop=document.querySelector('#word-popup');if(!pop)return;
 const body=pop.querySelector('#popup-content'),label=pop.querySelector('#popup-label');
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const triggers=[...document.querySelectorAll('[data-inspect]')];
 const people=[['Vasanthadithya Mundrathi','Captain · CBIT',D.sources.vasanth],['Sai Geethika Yedla','Vice-captain · CBIT',D.sources.geethika],['Akshay Kumar Akkapally','Member · CBIT','https://in.linkedin.com/in/akshay-kumar-akkapally-2971b9348'],['Faisal Tabrez','Member · MGIT',D.sources.faisal]];
 let active=null,view=null,pinned=false,timer=0,resultMode='overview',resultPage=0,selectedEvent=null,restoring=false;
 const feed=()=>window.H5XFeed.get();
 const status=()=>{const s=window.H5XFeed.status();return `<span class="feed-status ${s.healthy?'':'is-stale'}"><i aria-hidden="true"></i>${['live','pages'].includes(s.mode)&&s.healthy?'auto-updated':s.healthy?'saved record':'last verified record'} · ${escape(s.stamp)}</span>${s.mode==='pages'?`<span>checks every ${s.refreshMinutes} min</span>`:''}`;};
 const number=n=>Number(n).toLocaleString('en-GB',{maximumFractionDigits:3});
 const date=e=>e.time?new Date(e.time*1000).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}):String(e.year);
 function eventDetail(e){return `<div class="event-detail"><span class="event-place">#${e.place}</span><div>${out(e.url,escape(e.title)+' ↗')}<small class="mono">${date(e)} · ${number(e.points)} points · ${number(e.participants)} teams</small></div></div>`;}
 function resultContent(){
  const d=feed(),events=d.events,seasons=d.seasons;
  let content='';
  if(resultMode==='overview'){
   const selected=events.find(e=>e.id===selectedEvent)??events.at(-1);selectedEvent=selected?.id??null;
   content=`<div class="event-total"><strong>${events.length}</strong><span class="mono">CTFtime events since 2026.<br>Select a square to explore a result.</span></div><div class="event-grid" aria-label="H5X CTFtime results, oldest first">${events.map(e=>`<button type="button" class="event-square ${e.place<=3?'podium':''}" data-event="${e.id}" aria-pressed="${e.id===selectedEvent}" style="--strength:${Math.max(.2,1-Math.log10(e.place+1)/3.2)}" aria-label="${escape(e.title)}, position ${e.place}" title="${escape(e.title)} · #${e.place}"></button>`).join('')}</div><p class="grid-key mono">OLDEST → NEWEST <span><i></i> PODIUM</span></p>${seasons.map(s=>`<div class="season-row mono"><strong>${s.year}</strong><span><b>#${s.world}</b> world</span><span>${s.india?`<b>#${s.india}</b> India`:'India —'}</span><span>${s.events} events</span></div><p class="rating-points mono">${number(s.points)} rating points</p>`).join('')}${selected?eventDetail(selected):'<p>No results posted yet.</p>'}`;
  }else{
   const highlights=D.selected.flatMap(item=>{const match=item[4].match(/^https:\/\/ctftime\.org\/event\/(\d+)/);if(!match)return [item];const official=events.find(e=>e.id===Number(match[1]));return official?[[official.place,official.title,`${date(official)} · ${number(official.points)} points`,'CTFtime result',official.url]]:[];});
   const records=resultMode==='highlights'?highlights:[...events].reverse(),size=resultMode==='highlights'?4:5,pages=Math.max(1,Math.ceil(records.length/size));
   resultPage=Math.max(0,Math.min(resultPage,pages-1));
   content=records.slice(resultPage*size,(resultPage+1)*size).map(e=>resultMode==='highlights'?`<div class="result-row"><span class="place">#${Number(e[0])}</span><div>${out(e[4],escape(e[1]))}<small class="mono">${escape(e[2])} · ${escape(e[3])}</small></div></div>`:eventDetail(e)).join('');
   content+=`<div class="pager mono"><button type="button" data-result-step="-1" ${resultPage===0?'disabled':''}>← previous</button><span>${resultPage+1} / ${pages}</span><button type="button" data-result-step="1" ${resultPage===pages-1?'disabled':''}>next →</button></div>`;
  }
  return `<h2>Competition log.</h2><div class="result-switch mono">${[['overview','at a glance'],['archive','event log'],['highlights','highlights']].map(([key,name])=>`<button type="button" data-result-mode="${key}" aria-pressed="${resultMode===key}">${name}</button>`).join('')}</div>${content}<div class="feed-note mono">${status()}<span>CTFtime ${out(D.sources.ctf,'team 438630 ↗')}</span></div>`;
 }
 function content(){
  const d=feed(),s=d.seasons.at(-1);
  if(view==='profile')return `<div class="profile-monogram mono">H5X /</div><h2>Built on curiosity.</h2><p>Four core members, from CBIT and MGIT.<br>Hyderabad, India.</p><dl class="profile-facts mono"><div><dt>founded</dt><dd>2024 · hackathons & events</dd></div><div><dt>expanded</dt><dd>July 2026 · CTFs & bug hunting</dd></div><div><dt>CTFtime</dt><dd>${out(D.sources.ctf,'team 438630 ↗')}</dd></div></dl>${s?`<div class="profile-standing mono">${s.year} <strong>#${s.world}</strong> world <strong>#${s.india??'—'}</strong> India</div>`:''}<div class="popup-links mono"><button type="button" data-pop-view="team">meet the team ↗</button><button type="button" data-pop-view="results">competition log ↗</button></div><div class="feed-note mono">${status()}</div>`;
  if(view==='team')return `<h2>Four people. One team.</h2>${people.map(p=>`<div class="people"><strong>${out(p[2],escape(p[0]))}</strong><span class="mono">${escape(p[1])}</span></div>`).join('')}<p class="popup-footnote mono">CBIT × MGIT · HYDERABAD</p>`;
  if(view==='results')return resultContent();
  if(view==='build')return `<h2>Ideas into working things.</h2><p>Hackathons have been part of H5X since 2024.</p>${D.projects.slice(0,3).map(p=>`<div class="preview-row"><small class="mono">${escape(p[0])}</small><strong>${out(p[4],escape(p[1])+' ↗')}</strong><p>${escape(p[2])}</p></div>`).join('')}<a class="popup-page-link mono" href="hackathon.html">explore the builds ↗</a>`;
  if(view==='hunt')return `<h2>Look closer. Find the edge.</h2><p>We started bug hunting in July 2026. We investigate real systems, disclose responsibly, and follow through.</p><div class="preview-row"><strong>C-DAC · DeepSweep · Hack Monty</strong><p>Our captain Vasanthadithya’s work spans validated findings, coordinated disclosures, and a partial bounty.</p></div><a class="popup-page-link mono" href="bug-hunt.html">explore our research ↗</a>`;
  return `<h2>Show up. Stay curious.</h2>${D.events.slice(0,3).map(e=>`<div class="preview-row"><small class="mono">${escape(e[0])}</small><strong>${out(e[3],escape(e[1])+' ↗')}</strong></div>`).join('')}<div class="popup-links mono"><a href="events.html">events attended ↗</a><a href="gallery.html">open the gallery ↗</a></div>`;
 }
 function position(){
  if(pop.hidden||!active)return;
  if(innerWidth<=760){pop.style.left='12px';pop.style.top='auto';pop.style.bottom='12px';return;}
  pop.style.bottom='auto';
  const stage=document.querySelector('.stage-right').getBoundingClientRect(),r=active.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
  pop.style.left=Math.max(16,Math.min(stage.left,innerWidth-w-20))+'px';
  pop.style.top=Math.max(16,Math.min(r.top-12,innerHeight-h-20))+'px';
 }
 function render(){label.textContent={profile:'H5X / HYDERABAD',team:'04 PEOPLE / 02 COLLEGES',results:'THE PUBLIC RECORD',build:'BUILD / SINCE 2024',hunt:'BUG HUNT / SINCE JUL 2026',events:'OUT IN THE WORLD'}[view];body.innerHTML=content();position();}
 function open(next,trigger,pin=false){
  clearTimeout(timer);if(pinned&&!pin&&view!==next)return;
  const changed=view!==next||pop.hidden;view=next;active=trigger||active;pinned=pin||pinned;pop.hidden=false;
  triggers.forEach(b=>b.setAttribute('aria-expanded',String(b===active)));pop.dataset.pinned=String(pinned);
  render();if(changed)sound.note(next==='team'?0:next==='results'?2:1);
 }
 function close(restore=false){clearTimeout(timer);pop.hidden=true;pinned=false;view=null;triggers.forEach(b=>b.setAttribute('aria-expanded','false'));if(restore){restoring=true;active?.focus({preventScroll:true});queueMicrotask(()=>restoring=false);}}
 function schedule(){clearTimeout(timer);if(!pinned)timer=setTimeout(()=>{if(!pop.matches(':hover')&&!triggers.some(b=>b.matches(':hover'))&&!pop.contains(document.activeElement))close();},650);}
 triggers.forEach(b=>{
  b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','word-popup');b.setAttribute('aria-haspopup','dialog');
  b.addEventListener('pointerenter',()=>{if(fine.matches)open(b.dataset.inspect,b);});b.addEventListener('pointerleave',schedule);
  b.addEventListener('focus',()=>{if(!restoring)open(b.dataset.inspect,b);});
  b.addEventListener('blur',schedule);
  b.addEventListener('click',e=>{
   if(b.tagName==='A'&&fine.matches)return;
   e.preventDefault();if(pinned&&active===b)close();else{open(b.dataset.inspect,b,true);if(e.detail===0)pop.querySelector('#popup-close').focus({preventScroll:true});}
  });
 });
 pop.addEventListener('pointerenter',()=>clearTimeout(timer));pop.addEventListener('pointerleave',schedule);
 pop.addEventListener('focusin',()=>clearTimeout(timer));pop.addEventListener('focusout',schedule);
 pop.querySelector('#popup-close').addEventListener('click',()=>close(true));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){e.preventDefault();close(true);}});
 document.addEventListener('pointerdown',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!e.target.closest('[data-inspect]'))close();});
 pop.addEventListener('click',e=>{
  const mode=e.target.closest('[data-result-mode]'),step=e.target.closest('[data-result-step]'),event=e.target.closest('[data-event]'),next=e.target.closest('[data-pop-view]');
  if(mode){resultMode=mode.dataset.resultMode;resultPage=0;render();pop.querySelector(`[data-result-mode="${resultMode}"]`)?.focus({preventScroll:true});}
  if(step&&!step.disabled){const direction=step.dataset.resultStep;resultPage+=Number(direction);render();const target=pop.querySelector(`[data-result-step="${direction}"]:not(:disabled)`)??pop.querySelector('[data-result-step]:not(:disabled)');target?.focus({preventScroll:true});}
  if(event){selectedEvent=Number(event.dataset.event);render();pop.querySelector(`[data-event="${selectedEvent}"]`)?.focus({preventScroll:true});}
  if(next){view=next.dataset.popView;pinned=true;render();}
 });
 // A feed refresh replaces the complete view in one render, preserving the chosen event/page.
 document.addEventListener('h5x:ctftime',()=>{if(!pop.hidden){const key=document.activeElement?.dataset.event;render();if(key)pop.querySelector(`[data-event="${key}"]`)?.focus({preventScroll:true});}});
 addEventListener('resize',position);addEventListener('scroll',position,{passive:true});
 const initial=new URLSearchParams(location.search).get('view');if(['profile','team','results'].includes(initial))open(initial,triggers.find(b=>b.dataset.inspect===initial),true);
})();

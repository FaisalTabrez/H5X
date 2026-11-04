// H5X's page content, navigation details and accessible controls.
const D=JSON.parse(document.getElementById('h5x-data').textContent);
const $=(selector,parent=document)=>parent.querySelector(selector);
const root=document.documentElement;
const mq=matchMedia('(prefers-color-scheme: dark)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const current=()=>root.dataset.theme||(mq.matches?'dark':'light');
const sound=window.h5xSound;
window.H5XViews=new Map();
function paintBar(){document.querySelectorAll('[data-set]').forEach(button=>{const active=button.dataset.set===current();button.classList.toggle('on',active);button.setAttribute('aria-pressed',String(active));});$('meta[name="theme-color"]').content=current()==='dark'?'#141211':'#f6f2e9';}
document.querySelectorAll('[data-set]').forEach(button=>button.addEventListener('click',()=>{root.dataset.theme=button.dataset.set;try{localStorage.setItem('h5x-theme',button.dataset.set);}catch(e){}paintBar();sound.theme(button.dataset.set);}));
mq.addEventListener('change',paintBar);paintBar();
function clock(){$('#clock').textContent=`${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})} in Hyderabad`;}
clock();setInterval(clock,30000);
let manualMotionPause=false;try{manualMotionPause=localStorage.getItem('h5x-motion')==='paused';}catch(e){}
window.h5xMotionPaused=reduced.matches||manualMotionPause;
const motion=$('#motion');motion.hidden=false;
function paintMotion(){
 motion.textContent=window.h5xMotionPaused?'resume motion':'pause motion';motion.setAttribute('aria-pressed',String(window.h5xMotionPaused));
 root.classList.toggle('no-motion',window.h5xMotionPaused);motion.disabled=reduced.matches;
 const scatter=$('#scatter');if(scatter)scatter.disabled=window.h5xMotionPaused;
}
motion.addEventListener('click',()=>{
 manualMotionPause=!manualMotionPause;window.h5xMotionPaused=reduced.matches||manualMotionPause;
 try{localStorage.setItem('h5x-motion',manualMotionPause?'paused':'running');}catch(e){}
 paintMotion();document.dispatchEvent(new Event('h5x:motion'));
});
reduced.addEventListener('change',()=>{window.h5xMotionPaused=reduced.matches||manualMotionPause;paintMotion();document.dispatchEvent(new Event('h5x:motion'));});
paintMotion();$('#scatter')?.addEventListener('click',()=>document.dispatchEvent(new Event('h5x:scatter')));

const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const out=(url,label)=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
function makeCollection(key,container,items,draw,size=4,initialGroup=0){
 if(!container)return;
 const groups=Math.ceil(items.length/size);let group=Math.max(0,Math.min(groups-1,initialGroup));
 function render(direction=0,from=group){
  const html=items.slice(group*size,(group+1)*size).map((item,i)=>draw(item,group*size+i)).join('');
  window.H5XMotion.swap(container,html,direction,from,group,Boolean(direction));
  container.dataset.position=String(group);window.H5XMotion.changed(key);
 }
 const controller={target:container,state:()=>({index:group,total:groups}),goTo(next,animate=true){
  const nextGroup=Math.max(0,Math.min(groups-1,next));if(nextGroup===group)return false;
  const from=group,direction=Math.sign(nextGroup-group);group=nextGroup;sound.note(group);render(animate?direction:0,from);return true;
 },next(direction){return this.goTo(group+direction);}};
 window.H5XViews.set(key,controller);render();return controller;
}

const compactRecords=matchMedia('(max-height:800px), (max-width:760px)').matches;
const researchList=$('.research-list');
if(researchList){
 const items=[...researchList.querySelectorAll('.research')].map(item=>item.outerHTML),cards=document.createElement('div');
 researchList.querySelectorAll('.research').forEach(item=>item.remove());researchList.append(cards);
 makeCollection('research',cards,items,item=>item,1);
}

const projectRow=(item,index)=>`<article class="index-entry"><span class="entry-number mono">${String(index+1).padStart(2,'0')}</span><div><div class="eyebrow mono">${escape(item[0])}</div><h2>${escape(item[1])}</h2><p>${escape(item[2])}</p><div class="credit mono">${escape(item[3])}</div></div>${out(item[4],'<span class="outbound" aria-label="View source for '+escape(item[1])+'">↗</span>')}</article>`;
makeCollection('projects',$('#project-list'),[...D.projects,...D.earlier],projectRow,compactRecords?2:3);
makeCollection('events',$('#event-list'),D.events,(item,index)=>`<article class="index-entry"><span class="entry-number mono">${String(index+1).padStart(2,'0')}</span><div><div class="eyebrow mono">${escape(item[0])}</div><h2>${escape(item[1])}</h2><p>${escape(item[2])}</p></div><a data-event-source href="${escape(item[3])}" target="_blank" rel="noopener noreferrer" aria-label="Read the post about ${escape(item[1])} (${escape(item[0])})" title="View event post: ${escape(item[1])}"><span class="outbound" aria-hidden="true">↗</span></a></article>`,compactRecords?2:4);

const photos=D.gallery;
if($('#photo-list')){
 let selected=0;const dialog=$('#photo-dialog'),requested=new URLSearchParams(location.search).get('photo');
 const initial=Math.max(0,photos.findIndex(p=>p.file.split('/').at(-1)===requested));
 $('.gallery-count').textContent=`${photos.length} MOMENTS / ${new Set(photos.map(p=>p.source)).size} EVENTS`;
 const photoCollection=makeCollection('photos',$('#photo-list'),photos,(p,i)=>`<button type="button" class="photo-choice" data-photo="${i}" aria-pressed="${i===initial}"><img src="${p.file}" alt=""><span><strong>${escape(p.title)}</strong><small class="mono">${escape(p.event)}</small></span></button>`,3,Math.floor(initial/3));
 function selectPhoto(index,direction=1,animate=true){
  const previous=selected;selected=index;const p=photos[index];
  window.H5XMotion.swap($('#expand-photo'),`<img id="featured-image" src="${escape(p.file)}" alt="${escape(p.alt)}">`,direction,previous,index,animate);
  $('#featured-title').textContent=p.title;$('#featured-source').href=p.source;
  document.querySelectorAll('.motion-current [data-photo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.photo)===index)));
  for(const neighbor of [photos[index-1],photos[index+1]])if(neighbor){const preload=new Image();preload.src=neighbor.file;}
  window.H5XMotion.changed('gallery');
 }
 window.H5XViews.set('gallery',{target:$('.featured-photo'),state:()=>({index:selected,total:photos.length}),next(direction){
  const next=Math.max(0,Math.min(photos.length-1,selected+direction));if(next===selected)return false;
  photoCollection.goTo(Math.floor(next/3),false);selectPhoto(next,direction);sound.note(next);return true;
 }});
 $('#photo-list').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b){selectPhoto(Number(b.dataset.photo));sound.note(Number(b.dataset.photo));}});
 $('#expand-photo').addEventListener('click',()=>{const p=photos[selected];$('img',dialog).src=p.file;$('img',dialog).alt=p.alt;$('#photo-title').textContent=p.title;$('a',dialog).href=p.source;dialog.showModal();});
 $('.dialog-close',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});selectPhoto(initial,1,false);
}

// H5X's page content, navigation details and accessible controls.
const D=JSON.parse(document.getElementById('h5x-data').textContent);
const $=(selector,parent=document)=>parent.querySelector(selector);
const root=document.documentElement;
const mq=matchMedia('(prefers-color-scheme: dark)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const current=()=>root.dataset.theme||(mq.matches?'dark':'light');
const sound=window.h5xSound;
window.H5XViews=new Map();
window.H5XMotion={
 enter(elements,direction=1){
  if(reduced.matches||window.h5xMotionPaused)return;
  [...elements].filter(Boolean).forEach((element,i)=>{
   element.getAnimations().forEach(animation=>animation.cancel());
   element.animate([{opacity:0,transform:`translateY(${direction*28}px)`,filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:480,delay:Math.min(i,5)*35,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
  });
 },
 changed(key){document.dispatchEvent(new CustomEvent('h5x:viewchange',{detail:{key}}));}
};
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
function makePager(key,container,items,draw,size=4,initialPage=0){
 const bar=$(`[data-pager="${key}"]`);if(!container||!bar)return;
 const pages=Math.ceil(items.length/size);let page=Math.max(0,Math.min(pages-1,initialPage));
 function render(direction=0){
  container.innerHTML=items.slice(page*size,(page+1)*size).map((item,i)=>draw(item,page*size+i)).join('');
  $('span',bar).textContent=`${String(page+1).padStart(2,'0')} / ${String(pages).padStart(2,'0')}`;
  $('[data-direction="-1"]',bar).disabled=page===0;$('[data-direction="1"]',bar).disabled=page===pages-1;
  container.dataset.page=String(page);if(direction)window.H5XMotion.enter(container.children,direction);window.H5XMotion.changed(key);
 }
 const controller={target:container,state:()=>({index:page,total:pages}),goTo(next,animate=true){
  const nextPage=Math.max(0,Math.min(pages-1,next));if(nextPage===page)return false;
  const direction=Math.sign(nextPage-page);page=nextPage;sound.note(page);render(animate?direction:0);return true;
 },next(direction){return this.goTo(page+direction);}};
 window.H5XViews.set(key,controller);
 bar.addEventListener('click',event=>{const button=event.target.closest('[data-direction]');if(button&&!button.disabled)controller.next(Number(button.dataset.direction));});
 render();return controller;
}
const compactRecords=matchMedia('(max-height:800px), (max-width:760px)').matches;
const researchList=$('.research-list');
if(researchList){
 const items=[...researchList.querySelectorAll('.research')].map(item=>item.outerHTML),bar=$('[data-pager="research"]',researchList),cards=document.createElement('div');
 researchList.querySelectorAll('.research').forEach(item=>item.remove());researchList.insertBefore(cards,bar);bar.hidden=false;
 makePager('research',cards,items,item=>item,1);
}

const projectRow=(item,index)=>`<article class="index-entry"><span class="entry-number mono">${String(index+1).padStart(2,'0')}</span><div><div class="eyebrow mono">${escape(item[0])}</div><h2>${escape(item[1])}</h2><p>${escape(item[2])}</p><div class="credit mono">${escape(item[3])}</div></div>${out(item[4],'<span class="outbound" aria-label="View source for '+escape(item[1])+'">↗</span>')}</article>`;
makePager('projects',$('#project-list'),[...D.projects,...D.earlier],projectRow,compactRecords?2:3);
makePager('events',$('#event-list'),D.events,(item,index)=>`<article class="index-entry"><span class="entry-number mono">${String(index+1).padStart(2,'0')}</span><div><div class="eyebrow mono">${escape(item[0])}</div><h2>${escape(item[1])}</h2><p>${escape(item[2])}</p></div><a data-event-source href="${escape(item[3])}" target="_blank" rel="noopener noreferrer" aria-label="Read the post about ${escape(item[1])} (${escape(item[0])})" title="View event post: ${escape(item[1])}"><span class="outbound" aria-hidden="true">↗</span></a></article>`,compactRecords?2:4);

const photos=D.gallery;
if($('#photo-list')){
 let selected=0;const dialog=$('#photo-dialog'),requested=new URLSearchParams(location.search).get('photo');
 const initial=Math.max(0,photos.findIndex(p=>p.file.split('/').at(-1)===requested));
 $('.gallery-count').textContent=`${photos.length} MOMENTS / ${new Set(photos.map(p=>p.source)).size} EVENTS`;
 const photoPager=makePager('photos',$('#photo-list'),photos,(p,i)=>`<button type="button" class="photo-choice" data-photo="${i}" aria-pressed="${i===initial}"><img src="${p.file}" alt=""><span><strong>${escape(p.title)}</strong><small class="mono">${escape(p.event)}</small></span></button>`,3,Math.floor(initial/3));
 function selectPhoto(index,direction=1,animate=true){
  selected=index;const p=photos[index],image=$('#featured-image');image.src=p.file;image.alt=p.alt;
  $('#featured-title').textContent=p.title;$('#featured-source').href=p.source;
  document.querySelectorAll('[data-photo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.photo)===index)));
  for(const neighbor of [photos[index-1],photos[index+1]])if(neighbor){const preload=new Image();preload.src=neighbor.file;}
  if(animate)window.H5XMotion.enter([image,$('.featured-photo figcaption')],direction);
  window.H5XMotion.changed('gallery');
 }
 window.H5XViews.set('gallery',{target:$('.featured-photo'),state:()=>({index:selected,total:photos.length}),next(direction){
  const next=Math.max(0,Math.min(photos.length-1,selected+direction));if(next===selected)return false;
  photoPager.goTo(Math.floor(next/3),false);selectPhoto(next,direction);sound.note(next);return true;
 }});
 $('#photo-list').addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b){selectPhoto(Number(b.dataset.photo));sound.note(Number(b.dataset.photo));}});
 document.querySelector('[data-pager="photos"]').addEventListener('click',()=>{const first=$('[data-photo]');if(first)selectPhoto(Number(first.dataset.photo));});
 $('#expand-photo').addEventListener('click',()=>{const p=photos[selected];$('img',dialog).src=p.file;$('img',dialog).alt=p.alt;$('#photo-title').textContent=p.title;$('a',dialog).href=p.source;dialog.showModal();});
 $('.dialog-close',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});selectPhoto(initial,1,false);
}

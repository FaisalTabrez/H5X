// Keep both ends of a transition alive so an opposite gesture can reverse the same animation.
(() => {
 const transitions=new Map(),entrances=new Set();
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||window.h5xMotionPaused;
 const timing={duration:520,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'};
 function expose(layer,visible){
  layer.classList.toggle('motion-current',visible);layer.inert=!visible;
  if(visible)layer.removeAttribute('aria-hidden');else layer.setAttribute('aria-hidden','true');
  layer.querySelectorAll('[id],[data-motion-id]').forEach(element=>{
   if(!visible&&element.id){element.dataset.motionId=element.id;element.removeAttribute('id');}
   if(visible&&element.dataset.motionId){element.id=element.dataset.motionId;delete element.dataset.motionId;}
  });
 }
 function layer(html,container){const element=document.createElement(container.tagName==='BUTTON'?'span':'div');element.className='motion-layer';element.innerHTML=html;return element;}
 function finish(container,state){
  if(transitions.get(container)!==state)return;
  transitions.delete(container);state.animations.forEach(animation=>animation.cancel());
  const current=state.target===state.from?state.old:state.incoming;
  container.replaceChildren(current);expose(current,true);container.style.height='';delete container.dataset.moving;
 }
 function settle(container,state){
  const version=++state.version;
  Promise.allSettled(state.animations.map(animation=>animation.finished)).then(()=>{
   if(version===state.version)finish(container,state);
  });
 }
 window.H5XMotion={
  enter(elements,direction=1){
   if(reduce())return;
   [...elements].filter(Boolean).forEach((element,i)=>{
    const animation=element.animate([{opacity:0,transform:`translateY(${direction*18}px)`},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:Math.min(i,3)*25,easing:timing.easing});
    entrances.add(animation);animation.finished.catch(()=>{}).finally(()=>entrances.delete(animation));
   });
  },
  swap(container,html,direction,from,to,animate=true){
   let active=transitions.get(container);
   if(active&&animate&&!reduce()&&(to===active.from||to===active.to)){
    if(active.target!==to){
     active.target=to;expose(active.old,to===active.from);expose(active.incoming,to===active.to);
     active.animations.forEach(animation=>animation.reverse());settle(container,active);
    }
    return;
   }
   if(active)finish(container,active);
   const old=container.querySelector(':scope > .motion-current'),incoming=layer(html,container);
   container.classList.add('motion-deck');
   if(!old||!animate||reduce()){
    container.replaceChildren(incoming);expose(incoming,true);return;
   }
   const oldHeight=old.getBoundingClientRect().height;
   expose(old,false);container.append(incoming);expose(incoming,true);
   const newHeight=incoming.getBoundingClientRect().height;
   container.style.height=`${newHeight}px`;container.dataset.moving='true';
   active={old,incoming,from,to,target:to,version:0,animations:[
    old.animate([{transform:'translateY(0)',opacity:1},{transform:`translateY(${-direction*100}%)`,opacity:.2}],timing),
    incoming.animate([{transform:`translateY(${direction*100}%)`,opacity:.2},{transform:'translateY(0)',opacity:1}],timing),
    container.animate([{height:`${oldHeight}px`},{height:`${newHeight}px`}],timing)
   ]};
   transitions.set(container,active);settle(container,active);
  },
  isActive(target){return [...transitions.keys()].some(container=>target===container||target?.contains(container));},
  changed(key){document.dispatchEvent(new CustomEvent('h5x:viewchange',{detail:{key}}));}
 };
 document.addEventListener('h5x:motion',()=>{
  if(!reduce())return;
  for(const [container,state] of transitions)finish(container,state);
  for(const animation of entrances)animation.finish();
 });
})();

import {ScrollGesture,wheelPixels,boundedStep} from './scroll-gesture.js';

const main=document.querySelector('main'),controls=document.querySelector('#scroll-controls');
const page=document.body.dataset.page,views=window.H5XViews;
const key={ctf:'home',bugs:'research',hackathon:'projects',events:'events',gallery:'gallery'}[page];
const view=views?.get(key);
if(main&&controls&&view){
 const gesture=new ScrollGesture(),hint=controls.querySelector('[data-scroll-hint]'),count=controls.querySelector('[data-scroll-count]');
 const previous=controls.querySelector('[data-scroll-step="-1"]'),next=controls.querySelector('[data-scroll-step="1"]');
 const noun={home:'turn the logo',research:'explore our research',projects:'explore the builds',events:'explore the events',gallery:'explore the photographs'}[key];
 const excluded='input,textarea,select,[contenteditable="true"],dialog[open],.word-popup:not([hidden])';
 let touch=null;
 function update(){
  const {index,total}=view.state(),paused=key==='home'&&(window.h5xMotionPaused||matchMedia('(prefers-reduced-motion: reduce)').matches);
  hint.textContent=paused?'motion paused':total&&index===total-1?'scroll up to revisit':`scroll down to ${noun}`;
  count.textContent=total?`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`:'↕';
  previous.disabled=paused||Boolean(total&&index===0);next.disabled=paused||Boolean(total&&index===total-1);
  previous.setAttribute('aria-label',key==='home'?'Turn logo back':'Previous content');
  next.setAttribute('aria-label',key==='home'?'Turn logo forward':'Next content');
  main.dataset.scene=key;main.dataset.sceneIndex=String(index);
 }
 function advance(direction){
  if(document.querySelector('dialog[open],.word-popup:not([hidden])'))return;
  const {index,total}=view.state();if(total&&boundedStep(index,direction,total)===index)return;
  if(view.next(direction)){
   const rect=view.target?.getBoundingClientRect(),frame=main.getBoundingClientRect();
   if(rect&&(rect.top<frame.top||rect.bottom>frame.bottom))main.scrollTop+=rect.top-frame.top-16;
   update();
  }
 }
 // Preserve native reading inside overflowing text, cards and popup panels.
 function canReadScroll(target,direction){
  for(let node=target instanceof Element?target:null;node&&node!==document.body;node=node.parentElement){
   const style=getComputedStyle(node),max=node.scrollHeight-node.clientHeight;
   if(/auto|scroll/.test(style.overflowY)&&max>2&&((direction>0&&node.scrollTop<max-2)||(direction<0&&node.scrollTop>2)))return true;
  }
  return false;
 }
 document.addEventListener('wheel',event=>{
  if(event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.target.closest?.(excluded))return;
  if(document.querySelector('dialog[open],.word-popup:not([hidden])'))return;
  const delta=wheelPixels(event.deltaY,event.deltaMode,main.clientHeight),direction=Math.sign(delta);
  if(canReadScroll(event.target,direction)){gesture.consume(performance.now());return;}
  if(event.cancelable)event.preventDefault();
  const step=gesture.push(delta,performance.now());if(step)advance(step);
 },{passive:false});
 main.addEventListener('touchstart',event=>{
  touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,target:event.target,used:false}:null;
 },{passive:true});
 main.addEventListener('touchmove',event=>{
  if(!touch||event.touches.length!==1||touch.target.closest?.(excluded))return;
  const dx=touch.x-event.touches[0].clientX,dy=touch.y-event.touches[0].clientY;
  if(Math.abs(dx)>Math.abs(dy)||touch.reading)return;
  if(canReadScroll(touch.target,Math.sign(dy))){touch.reading=true;return;}
  if(event.cancelable)event.preventDefault();
  if(!touch.used&&Math.abs(dy)>64){touch.used=true;advance(Math.sign(dy));}
 },{passive:false});
 main.addEventListener('touchend',()=>{touch=null;},{passive:true});
 main.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
 document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key))return;
  if(![document.body,main].includes(document.activeElement))return;
  if(document.querySelector('dialog[open],.word-popup:not([hidden])'))return;
  const direction=['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:1;
  if(canReadScroll(main,direction))return;
  event.preventDefault();advance(direction);
 });
 controls.addEventListener('click',event=>{const button=event.target.closest('[data-scroll-step]');if(button&&!button.disabled)advance(Number(button.dataset.scrollStep));});
 document.addEventListener('h5x:viewchange',update);
 document.addEventListener('h5x:motion',update);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',update);
 document.body.classList.add('motion-ready');controls.hidden=false;main.tabIndex=0;
 update();window.H5XMotion.enter([...main.children],1);
}

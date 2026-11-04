import {ScrollGesture,wheelPixels,boundedStep} from './scroll-gesture.js';

const main=document.querySelector('main'),controls=document.querySelector('#scroll-controls');
const page=document.body.dataset.page,views=window.H5XViews;
const key={ctf:'home',bugs:'research',hackathon:'projects',events:'events',gallery:'gallery'}[page];
const view=views?.get(key);
if(main&&controls&&view){
 const gesture=new ScrollGesture(),hint=controls.querySelector('[data-scroll-hint]'),status=controls.querySelector('[data-scroll-status]');
 const noun={home:'turn the logo',research:'explore our research',projects:'explore the builds',events:'explore the events',gallery:'explore the photographs'}[key];
 const excluded='input,textarea,select,[contenteditable="true"],dialog[open],.word-popup:not([hidden])';
 let touch=null;
 function update(){
  const {index,total}=view.state(),paused=key==='home'&&(window.h5xMotionPaused||matchMedia('(prefers-reduced-motion: reduce)').matches);
  hint.textContent=paused?'motion paused':total&&index===total-1?'scroll up to revisit':`scroll ${index===0?'down':'down or up'} to ${noun}`;
  const titles=[...(view.target?.querySelectorAll('.motion-current h2')??[])].map(heading=>heading.textContent);
  status.textContent=key==='gallery'?document.querySelector('#featured-title').textContent:titles.join('. ');
  main.dataset.scene=key;main.dataset.sceneIndex=String(index);
 }
 function advance(direction){
  if(document.querySelector('dialog[open],.word-popup:not([hidden])'))return;
  const {index,total}=view.state();if(total&&boundedStep(index,direction,total)===index)return;
  if(view.next(direction)){
   const rect=view.target?.getBoundingClientRect(),frame=main.getBoundingClientRect();
   if(rect&&(rect.top<frame.top||rect.bottom>frame.bottom))main.scrollTo({top:main.scrollTop+rect.top-frame.top-16,behavior:window.h5xMotionPaused?'instant':'smooth'});
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
  if(!window.H5XMotion.isActive(view.target)&&canReadScroll(event.target,direction)){gesture.consume(performance.now());return;}
  if(event.cancelable)event.preventDefault();
  const step=gesture.push(delta,performance.now());if(step)advance(step);
 },{passive:false});
 main.addEventListener('touchstart',event=>{
  touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,target:event.target,gesture:new ScrollGesture({threshold:56,reversalThreshold:32})}:null;
 },{passive:true});
 main.addEventListener('touchmove',event=>{
  if(!touch||event.touches.length!==1||touch.target.closest?.(excluded))return;
  const dx=touch.x-event.touches[0].clientX,dy=touch.y-event.touches[0].clientY;
  touch.x=event.touches[0].clientX;touch.y=event.touches[0].clientY;
  if(Math.abs(dx)>Math.abs(dy)||touch.reading)return;
  if(!window.H5XMotion.isActive(view.target)&&canReadScroll(touch.target,Math.sign(dy))){touch.reading=true;return;}
  if(event.cancelable)event.preventDefault();
  const step=touch.gesture.push(dy,performance.now());if(step)advance(step);
 },{passive:false});
 main.addEventListener('touchend',()=>{touch=null;},{passive:true});
 main.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
 document.addEventListener('keydown',event=>{
  if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||!['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key))return;
  if(![document.body,main].includes(document.activeElement))return;
  if(document.querySelector('dialog[open],.word-popup:not([hidden])'))return;
  const direction=['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:1;
  if(!window.H5XMotion.isActive(view.target)&&canReadScroll(main,direction))return;
  event.preventDefault();advance(direction);
 });
 document.addEventListener('h5x:viewchange',update);
 document.addEventListener('h5x:motion',update);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',update);
 document.body.classList.add('motion-ready');controls.hidden=false;main.tabIndex=0;main.setAttribute('aria-describedby','scroll-instructions');
 update();window.H5XMotion.enter([...main.children],1);
}

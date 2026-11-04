// One deliberate vertical gesture advances one scene, without trackpad momentum skipping records.
export class ScrollGesture {
 constructor({threshold=72,quietMs=180,cooldownMs=600}={}){
  Object.assign(this,{threshold,quietMs,cooldownMs});this.reset();
 }
 reset(){this.amount=0;this.lastInput=-Infinity;this.lastStep=-Infinity;this.locked=false;}
 consume(now){this.amount=0;this.lastInput=now;this.locked=true;}
 push(delta,now){
  if(!Number.isFinite(delta)||delta===0)return 0;
  if(now-this.lastInput>this.quietMs){this.amount=0;this.locked=false;}
  this.lastInput=now;
  if(this.locked||now-this.lastStep<this.cooldownMs)return 0;
  if(Math.sign(delta)!==Math.sign(this.amount))this.amount=0;
  this.amount+=Math.max(-120,Math.min(120,delta));
  if(Math.abs(this.amount)<this.threshold)return 0;
  const direction=Math.sign(this.amount);this.amount=0;this.lastStep=now;this.locked=true;return direction;
 }
}

export function wheelPixels(delta,mode,pageHeight){return delta*(mode===1?16:mode===2?pageHeight:1);}
export function boundedStep(index,direction,total){return Math.max(0,Math.min(total-1,index+Math.sign(direction)));}

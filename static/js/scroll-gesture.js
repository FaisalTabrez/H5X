// One deliberate vertical gesture advances one scene, without trackpad momentum skipping records.
export class ScrollGesture {
 constructor({threshold=64,reversalThreshold=36,quietMs=140,cooldownMs=520}={}){
  Object.assign(this,{threshold,reversalThreshold,quietMs,cooldownMs});this.reset();
 }
 reset(){this.amount=0;this.lastInput=-Infinity;this.lastStep=-Infinity;this.locked=false;this.direction=0;}
 consume(now){this.amount=0;this.lastInput=now;this.locked=true;this.direction=0;}
 push(delta,now){
  if(!Number.isFinite(delta)||delta===0)return 0;
  if(now-this.lastInput>this.quietMs){this.amount=0;this.locked=false;}
  this.lastInput=now;
  if(Math.sign(delta)!==Math.sign(this.amount))this.amount=0;
  const reversing=this.direction!==0&&Math.sign(delta)!==this.direction;
  if((this.locked||now-this.lastStep<this.cooldownMs)&&!reversing)return 0;
  this.amount+=Math.max(-120,Math.min(120,delta));
  if(Math.abs(this.amount)<(reversing?this.reversalThreshold:this.threshold))return 0;
  const direction=Math.sign(this.amount);this.amount=0;this.lastStep=now;this.locked=true;this.direction=direction;return direction;
 }
}

export function wheelPixels(delta,mode,pageHeight){return delta*(mode===1?16:mode===2?pageHeight:1);}
export function boundedStep(index,direction,total){return Math.max(0,Math.min(total-1,index+Math.sign(direction)));}

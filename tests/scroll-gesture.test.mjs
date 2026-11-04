import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ScrollGesture,wheelPixels,boundedStep} from '../static/js/scroll-gesture.js';

test('small trackpad movements accumulate into one deliberate step',()=>{
 const g=new ScrollGesture();assert.equal(g.push(24,0),0);assert.equal(g.push(24,30),0);assert.equal(g.push(24,60),1);
});
test('a long momentum tail cannot skip several pages',()=>{
 const g=new ScrollGesture();assert.equal(g.push(100,0),1);
 for(let time=20;time<1800;time+=20)assert.equal(g.push(90,time),0);
 assert.equal(g.push(100,2100),1);
});
test('a reversal clears accumulated movement and scroll-up moves backward',()=>{
 const g=new ScrollGesture();assert.equal(g.push(60,0),0);assert.equal(g.push(-20,30),0);assert.equal(g.push(-60,60),-1);
});
test('fresh input during the transition cooldown cannot advance again',()=>{
 const g=new ScrollGesture();assert.equal(g.push(100,0),1);assert.equal(g.push(100,250),0);assert.equal(g.push(100,700),1);
});
test('pixel, line and page wheel units normalize consistently',()=>{
 assert.equal(wheelPixels(3,0,500),3);assert.equal(wheelPixels(3,1,500),48);assert.equal(wheelPixels(1,2,500),500);
});
test('finishing an inner text scroll does not advance on its remaining momentum',()=>{
 const g=new ScrollGesture();g.consume(0);g.consume(50);assert.equal(g.push(120,90),0);assert.equal(g.push(120,400),1);
});
test('content stepping stops at the ends instead of changing routes or wrapping',()=>{
 assert.equal(boundedStep(0,-1,7),0);assert.equal(boundedStep(6,1,7),6);assert.equal(boundedStep(3,-1,7),2);
});

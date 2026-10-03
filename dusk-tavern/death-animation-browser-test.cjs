'use strict';
const A=require('node:assert/strict'),{chromium}=require('playwright'),path=require('node:path'),{pathToFileURL}=require('node:url'),E=require('./engine');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(__dirname,'..','sv_tavern.html')).href);await page.locator('[data-action="start"]').click();
 await page.evaluate(()=>{window.makeDeparture=(speed=1,count=1,reborn=false)=>{
  TavernFX.reset();document.querySelector('.fx-fixture')?.remove();
  const host=document.createElement('div');host.className='fx-fixture cards-row battle-row';Object.assign(host.style,{position:'fixed',left:'300px',top:'250px',zIndex:'100'});document.body.append(host);
  const template=document.querySelector('#app .card'),old=[];
  for(let i=0;i<count;i++){const el=template.cloneNode(true);el.classList.add('damaged','spell-struck');el.dataset.area='combat';el.dataset.card=String(900001+i);el.insertAdjacentHTML('beforeend','<span class="fx-number loss">−99</span>');host.append(el);old.push({id:'neutral0',uid:i+1,battleId:900001+i,health:0,attack:2,keywords:[]});}
  TavernFX.battle({boards:[old,[]]},new Map(),speed);const dom=TavernFX.captureDOM();host.replaceChildren();const next=[];
  if(reborn){const el=template.cloneNode(true);el.dataset.area='combat';el.dataset.card='910001';host.append(el);next.push({id:'neutral0',uid:1,battleId:910001,health:1,attack:2,keywords:[]});}
  TavernFX.battle({boards:[next,[]],kind:reborn?'summon':'death',to:reborn?910001:null},dom,speed);
 };});
 for(const speed of [1,2,4]){
  const r=await page.evaluate(speed=>{makeDeparture(speed);const g=document.querySelector('.fx-ghost'),a=g.getAnimations()[0],duration=a.effect.getTiming().duration;a.pause();const opacity=[];for(const fraction of [0,.25,.5,.75,1]){a.currentTime=duration*fraction;opacity.push(+getComputedStyle(g).opacity);}a.finish();return {opacity,afterFinish:+getComputedStyle(g).opacity,fill:a.effect.getTiming().fill,transient:g.matches('.damaged,.spell-struck')||!!g.querySelector('.fx-number'),interactive:g.hasAttribute('data-card')||g.hasAttribute('data-area')||!g.inert,captured:[...TavernFX.captureDOM().keys()].some(k=>k==='combat:900001')};},speed);
  A(r.opacity.every((x,i)=>i===0||x<=r.opacity[i-1]),JSON.stringify(r));A.equal(r.afterFinish,0);A.equal(r.fill,'both');A.equal(r.transient,false);A.equal(r.interactive,false);A.equal(r.captured,false);await page.waitForFunction(()=>!document.querySelector('.fx-ghost'));
 }
 await page.evaluate(()=>makeDeparture(1,2,true));A.equal(await page.locator('.fx-ghost').count(),2);A.equal(await page.locator('.fx-fixture [data-card="910001"]').count(),1);A(await page.evaluate(()=>TavernFX.captureDOM().has('combat:910001')));await page.evaluate(()=>TavernFX.reset());A.equal(await page.locator('.fx-ghost').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>makeDeparture());A.equal(await page.locator('.fx-ghost').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>{TavernFX.reset();document.querySelector('.fx-fixture').remove();});
 // Exercise actual replay rendering and skip cleanup using one fixed combat, without running AI.
 const s=E.create('royal',81212,'hard',['royal','night','rune','dragon']);s.board=[E.make(s,'neutral0',{attack:2,health:1}),E.make(s,'neutral1',{attack:0,health:1})];s.hand=[];s.shop=[];const r=E.combat(s,s.board,[E.make(s,'neutral0',{attack:100,health:1000})]);s.result={...r,opponent:'退场动画验证',fatigue:0,round:1};s.phase='result';
 await page.locator('[data-action="menu"]').click();await page.locator('#save-file').setInputFiles({name:'death-animation.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await page.locator('.modal').waitFor({state:'detached'});await page.locator('[data-action="replay"]').click();await page.waitForFunction(()=>!!document.querySelector('.fx-ghost'));
 await page.evaluate(()=>{const g=document.querySelector('.fx-ghost'),a=g.getAnimations()[0];a.pause();a.currentTime=a.effect.getTiming().duration*.5;});await page.screenshot({path:path.join(__dirname,'qa','death-animation.png')});await page.locator('[data-action="skip"]').evaluate(el=>el.click());A.equal(await page.locator('.fx-ghost').count(),0);A.equal(await page.locator('.result-box').count(),1);A.deepEqual(errors,[]);
 console.log('PASS monotonic departure at 1x/2x/4x, invisible final frame, immediate finish cleanup, no cloned hit effects, simultaneous deaths, separate rebirth identity, reduced motion and real replay skip cleanup; no AI games.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

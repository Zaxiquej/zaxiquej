'use strict';
const {chromium}=require('playwright'),A=require('node:assert/strict'),fs=require('node:fs'),E=require('./engine');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.clear());
 const url='http://127.0.0.1:8765/sv_tavern.html';A.deepEqual(Buffer.from(await(await fetch(url)).arrayBuffer()),fs.readFileSync('sv_tavern.html'));
 await p.goto(url);await p.locator('[data-action="start"]').tap();await p.locator('[data-action="menu"]').tap();
 const s=E.create('blood',54321,'hard',['blood','royal','rune','dragon']);s.hp=1;s.board=[E.make(s,'blood1')];s.hand=[E.make(s,'bloodImmunity')];s.shop=[];s.gold=10;s.tier=2;
 await p.locator('#save-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await p.locator('.modal').waitFor({state:'detached'});
 async function dock(){const r=await p.locator('[data-action="fight"]').boundingBox(),h=p.viewportSize().height;A(r.y>h-95&&r.y+r.height<=h);A(r.height>=44);A(await p.locator('[data-action="fight"]').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}));A(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 for(const v of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]){await p.setViewportSize(v);await p.evaluate(()=>scrollTo(0,0));await dock();await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await dock();}
 await p.setViewportSize({width:390,height:844});await p.locator('.hand-row .card').tap();
 const inspect=await p.locator('.mobile-inspect').boundingBox(),bar=await p.locator('.command-bar').boundingBox();A(inspect.y+inspect.height<=bar.y+2);await dock();
 await p.screenshot({path:'dusk-tavern/qa/mobile-fixed-controls.png'});
 const use=p.locator('.mobile-inspect [data-action="use"]');
 if(await use.count())await use.tap();else {await p.locator('.mobile-inspect .close-inspect').tap();await p.locator('.hand-row .card').dblclick();}
 await p.waitForTimeout(500);A((await p.evaluate(()=>TavernUI.getState())).bloodImmunity);A.match(await p.locator('.growth-strip').innerText(),/本回合自伤免伤/);
 await p.locator('[data-action="power"]').tap();const state=await p.evaluate(()=>TavernUI.getState());A.equal(state.hp,1);A.equal(state.bloodDamage,1);A(state.hand.some(c=>c.id==='bat'));await dock();
 await p.screenshot({path:'dusk-tavern/qa/blood-immunity-active.png'});
 await p.locator('[data-action="catalog"]').tap();await p.locator('#catalog-search').fill('悚惧气息');await p.locator('.catalog-entry').tap();A.match(await p.locator('.catalog-rules').innerText(),/自伤不扣除生命/);A(await p.locator('.catalog-art').evaluate(async img=>{await img.decode();return img.naturalWidth>0}));await p.screenshot({path:'dusk-tavern/qa/blood-immunity-catalog.png'});
 A.deepEqual(errors,[]);console.log('PASS 390/320 portrait and 844 landscape fixed controls, scrolling, inspector clearance, touch casting, one-HP power and embedded spell art; no AI games');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});

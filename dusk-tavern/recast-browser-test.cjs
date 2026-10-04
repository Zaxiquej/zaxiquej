'use strict';
const {chromium}=require('playwright'),A=require('node:assert/strict'),E=require('./engine');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[];p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.clear());await p.goto('http://127.0.0.1:8765/sv_tavern.html');
 await p.locator('[data-action="start"]').click();await p.locator('[data-action="menu"]').click();const s=E.create('olivia',24681,'hard',['forest','rune','dragon','blood']);s.gold=10;s.board=[E.make(s,'neutral1')];s.hand=[E.make(s,'coin')];s.shop=['seekMajority','discardEcho','grandBlessing','garden','mine','ancientAmplifier'].map(id=>E.make(s,id));s.progress.spellcraft=1234;s.progress.devotion=456;
 await p.locator('#save-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await p.locator('.modal').waitFor({state:'detached'});
 await p.locator('[data-action="power"]').click();A.match(await p.locator('[data-action="power"]').innerText(),/下一张法术施放两次/);await p.locator('.hand-row .card').dblclick();const state=await p.evaluate(()=>TavernUI.getState());A.equal(state.gold,11);A.equal(state.spells,2);A.equal(state.hand.length,0);
 for(const viewport of [{width:1280,height:800},{width:1440,height:1000},{width:390,height:844},{width:320,height:568},{width:844,height:390}]){
  await p.setViewportSize(viewport);await p.locator('.shop-row').scrollIntoViewIfNeeded();
  const checks=await p.locator('.shop-row .card').evaluateAll(cards=>cards.map(card=>{const price=card.querySelector('.cost'),effect=card.querySelector('.spell-live'),r=price.getBoundingClientRect(),e=effect.getBoundingClientRect(),c=card.getBoundingClientRect();return {price:price.textContent,inside:r.top>=c.top&&r.bottom<=c.bottom&&r.left>=c.left&&r.right<=c.right,separate:r.bottom<=e.top,z:getComputedStyle(price).zIndex};}));
  A.equal(checks[0].price,'4');A(checks.every(c=>c.inside&&c.separate&&+c.z>0),JSON.stringify({viewport,checks}));
  if(viewport.width===390||viewport.width===1280)await p.screenshot({path:'dusk-tavern/qa/recast-prices-'+viewport.width+'.png',timeout:15000});
 }
 A.deepEqual(errors,[]);console.log('PASS hero double cast through UI and unobscured spell/amulet prices at desktop, compact desktop, portrait 390/320 and landscape 844 widths');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});

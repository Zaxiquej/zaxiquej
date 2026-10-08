'use strict';
const {chromium}=require('playwright'),A=require('node:assert/strict'),E=require('./engine');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/sv_tavern.html');A.equal(await p.evaluate(()=>TavernData.rulesVersion),require('./data').rulesVersion);await p.locator('[data-action="start"]').click();
 const s=E.create('angel',72311,'hard',['forest','blood','night','royal']);s.tier=6;s.progress.batDeaths=12;s.bloodDamage=20;s.board=[E.make(s,'bat'),E.make(s,'forest13',{health:1,keywords:['taunt']}),E.make(s,'forest19'),E.make(s,'blood19')];s.hand=[E.make(s,'forest12')];s.shop=[];
 for(const o of s.opponents){o.hp=o.id===s.opponent?40:0;if(o.id===s.opponent){o.echoRound=s.round;o.board=[E.make(s,'neutral0',{attack:100,health:10000})];}}
 A(E.validate(s));await p.locator('[data-action="menu"]').click();await p.locator('#save-file').setInputFiles({name:'army.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await p.locator('.modal').waitFor({state:'detached'});
 await p.locator('[data-area="hand"]').click();A((await p.locator('.mobile-inspect').innerText()).includes('妖精军团永久 +2/+2'));await p.locator('#mobile-root [data-action="play"]').click();await p.waitForFunction(()=>TavernUI.getState().progress.fairy===2);
 const blood=s.board.find(c=>c.id==='blood19');await p.locator('[data-area="board"][data-card="'+blood.uid+'"]').click();const detail=await p.locator('.mobile-inspect').innerText();A(detail.includes('+44 攻击 / +44 生命'));await p.locator('[data-action="clear-select"]').click();
 await p.reload();await p.locator('[data-action="resume"]').click();A.equal(await p.evaluate(()=>TavernUI.getState().progress.batDeaths),12);A.equal(await p.evaluate(()=>TavernUI.getState().progress.fairy),2);
 await p.locator('[data-action="fight"]').click();await p.waitForFunction(()=>TavernUI.getState()?.phase==='result');const result=await p.evaluate(()=>TavernUI.getState().result);A(result.events.some(e=>e.text.includes('血翼进击')));A(result.events.some(e=>e.kind==='attack'&&e.text.includes('妖精')&&e.text.includes('连击')));A(result.progress[0].batDeaths>12);A(result.progress[0].fairy>=2);A(result.events.every(e=>e.boards.every(b=>b.length<=7)));
 await p.locator('[data-action="pause"]').click();await p.screenshot({path:'dusk-tavern/qa/army-rework-mobile.png'});await p.locator('[data-action="skip"]').click();await p.reload();await p.locator('[data-action="resume"]').click();A.equal(await p.evaluate(()=>TavernUI.getState().progress.batDeaths),result.progress[0].batDeaths);A.deepEqual(errors,[]);
 console.log('PASS mobile card deployment, six-star live numbers, fixed battle playback and saved army counters; no AI simulation.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

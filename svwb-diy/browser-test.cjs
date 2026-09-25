const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/29327/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const S=require('./engine'),fixtures={faith:[],accelerate:[],crystallize:[],zero:null};
for(let i=0;i<20000&&(fixtures.faith.length<2||fixtures.accelerate.length<2||!fixtures.crystallize.length||!fixtures.zero);i++){
 const c=S.generate('页面回归'+i);
 if(c.faiths.length&&fixtures.faith.length<2)fixtures.faith.push(c.name);
 if(c.alternateForms.some(f=>f.kind==='激奏')&&fixtures.accelerate.length<2)fixtures.accelerate.push(c.name);
 if(c.alternateForms.some(f=>f.kind==='结晶')&&!fixtures.crystallize.length)fixtures.crystallize.push(c.name);
 if(c.type==='follower'&&c.cost===1&&c.attack===0&&c.health===1)fixtures.zero??=c.name;
}
assert(fixtures.zero&&fixtures.faith.length===2&&fixtures.accelerate.length===2);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1200,height:950},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4173/svwb_diy.html?qa=4');assert.equal(response.status(),200);
  await page.waitForFunction(()=>typeof SVWB!=='undefined'&&SVWB.VERSION==='5.13');
  assert.equal(await page.locator('#name').inputValue(),'设计师您辛苦了');
  assert.equal(await page.locator('#chaos').isChecked(),false);
  assert.equal(await page.locator('#overpowered').count(),0);
  const ordinary=await page.evaluate(()=>JSON.stringify(current));
  await page.check('#chaos');assert(await page.evaluate(()=>current.chaos&&cardText(current).includes('究极混乱')));
  await page.click('#copy');assert((await page.evaluate(()=>navigator.clipboard.readText())).includes('究极混乱'));
  await page.uncheck('#chaos');assert.equal(await page.evaluate(()=>JSON.stringify(current)),ordinary);
  await page.fill('#name',fixtures.zero);await page.click('button[type=submit]');
  assert.equal(await page.locator('#attack').textContent(),'0');assert.equal(await page.locator('#health').textContent(),'1');
  await page.click('#copy');assert((await page.evaluate(()=>navigator.clipboard.readText())).includes('1费 0/1'));
  for(const type of ['spell','amulet','follower']){
   await page.selectOption('#filter-type',type);await page.click('#random');
   const data=await page.evaluate(()=>({type:current.type,name:current.name,hidden:document.getElementById('attack').parentElement.hidden,text:cardText(current),data:JSON.stringify(current)}));
   assert.equal(data.type,type);assert.equal(data.hidden,type!=='follower');assert.match(data.name,/^随机卡牌#\d{8}$/);assert(!data.text.includes('null'));
   await page.click('button[type=submit]');assert.equal(await page.evaluate(()=>JSON.stringify(current)),data.data);
   await page.click('#copy');assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),data.text);
  }
  await page.selectOption('#filter-type','amulet');await page.selectOption('#filter-class','6');await page.selectOption('#filter-rarity','3');await page.selectOption('#filter-cost','7+');
  await page.click('#random');assert.deepEqual(await page.evaluate(()=>[current.type,current.class,current.rarity,current.cost>=7]),['amulet',6,3,true]);
  const before=await page.locator('#name').inputValue();await page.click('#variant');assert.notEqual(await page.locator('#name').inputValue(),before);
  assert.deepEqual(await page.evaluate(()=>[current.type,current.class,current.rarity,current.cost>=7]),['amulet',6,3,true]);
  await page.check('#chaos');
  for(const rarity of ['0','3']){
   await page.selectOption('#filter-rarity',rarity);
   for(const button of ['#random','#variant']){
    await page.click(button);
    assert.deepEqual(await page.evaluate(()=>[current.type,current.class,current.rarity,current.cost>=7,current.chaos]),['amulet',6,Number(rarity),true,true]);
   }
  }
  await page.uncheck('#chaos');
  for(const [name,chaos] of [['召唤赋予回归272',false],['召唤赋予回归274',false],['召唤赋予回归57',true],['手牌事件回归113',false],['手牌事件回归138',true],['手牌事件回归46',false],['核心创造物回归173',false],['核心创造物回归1170',true],['核心创造物回归1780',false],['核心创造物回归3559',false],['实验体回归113',false],['实验体回归124',false],['扩展机制32',false],['扩展机制44',false],['扩展机制46',false],['扩展机制1563',true]]){
   await page.setChecked('#chaos',chaos);await page.fill('#name',name);await page.click('button[type=submit]');
   const c=await page.evaluate(()=>current);
   for(const t of c.tokens.filter(t=>t.type&&t.type!=='follower')){
    const box=page.locator('#tokens .token').filter({has:page.getByRole('heading',{name:t.name,exact:true})});
    assert((await box.locator('.token-meta').textContent()).includes(S.TYPES[t.type]));assert(!(await box.locator('.token-meta').textContent()).includes('0/0'));
   }
   if(c.emblems.some(e=>e.owner==='opponent'))assert((await page.locator('#emblems').textContent()).includes('对手获得'));
   await page.click('#copy');const text=(await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n');for(const t of c.tokens)assert(text.includes(t.text));
  }
  await page.uncheck('#chaos');
  // Manual entry remains independent of filters, including HTML-like names.
  await page.fill('#name','<b>设计师</b>#2026');await page.click('button[type=submit]');assert.equal(await page.locator('#card-name').textContent(),'<b>设计师</b>#2026');assert.equal(await page.locator('#card-name b').count(),0);
  for(const width of [1200,375]){
   await page.setViewportSize({width,height:950});
   const faithExamples=fixtures.faith;
   const accelerateExamples=[...fixtures.accelerate,...fixtures.crystallize];
   for(const name of ['对手复制233','对手复制704','对手复制1723','原创附属卡29','原创附属卡3945','原创附属卡1291','全类型验证1343','全类型验证11','全类型验证129','校验种子200',...faithExamples,...new Set(accelerateExamples)]){
    await page.fill('#name',name);await page.click('button[type=submit]');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px overflow: ${name}`);
    assert(await page.locator('#variant').isVisible());
    if(faithExamples.includes(name)){
     const text=await page.evaluate(()=>cardText(current));await page.click('#copy');
     assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),text);
     assert(text.includes('信仰值起始为0。')&&text.includes('消耗'));
    }
    if(accelerateExamples.includes(name)){
     const form=await page.evaluate(()=>current.alternateForms[0]);
     assert((await page.locator('#alternate-forms').textContent()).includes(form.text));
     assert(await page.evaluate(()=>document.getElementById('alternate-forms').getBoundingClientRect().bottom<=document.getElementById('abilities').getBoundingClientRect().top));
     assert.equal(await page.locator('#alternate-forms hr').count(),1);
     assert(!(await page.locator('#abilities').textContent()).includes('能力见下方'));
     await page.click('#copy');const copied=(await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n');
     assert(copied.includes(form.text));
     assert(copied.indexOf(form.text)<copied.indexOf('\n\n---\n\n'));
     assert.equal(copied.split(`【${form.kind} ${form.cost}】`).length,2);
     for(const token of form.tokens||[])assert(copied.includes(token.name));
    }
   }
  }
  const historyExamples=require('./history-validation.json').examples;
  for(const example of [...Object.values(require('./fusion-event-validation.json').examples).map(name=>({name,chaos:false})),...Object.values(require('./health-transform-validation.json').examples),...Object.values(require('./discard-quality-validation.json').examples),...Object.values(require('./low-cost-conditions-validation.json').examples),...Object.values(require('./unlock-condition-validation.json').examples),...Object.values(require('./sacrifice-validation.json').examples),...Object.values(require('./high-rarity-validation.json').examples),...Object.values(require('./token-luck-validation.json').examples),...[historyExamples.invocationReturn,historyExamples.invocationStay].map(name=>({name,chaos:false}))]){
   await page.setChecked('#chaos',example.chaos);await page.fill('#name',example.name);await page.click('button[type=submit]');
   const expected=S.generate(example.name,{chaos:example.chaos});
   assert.equal(await page.evaluate(()=>JSON.stringify(current)),JSON.stringify(expected));
   const text=await page.evaluate(()=>cardText(current));await page.click('#copy');
   assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),text);
   for(const a of expected.abilities.filter(a=>a.kind==='handLuck'))assert(text.includes(a.bodyText),'Keep reshuffle, X definition and hand-pattern payoff together');
   for(const a of expected.abilities.filter(a=>a.orderedEffects))assert(text.includes(a.text),'Keep payment before reward in the page and clipboard');
   for(const e of expected.emblems.filter(e=>e.luck))assert(text.includes(e.text),'Copy both favorable and unfavorable draw branches');
   for(const a of expected.abilities.filter(a=>a.kind==='invocation'||a.kind==='invocationArrival'))assert(text.includes(a.text),'Keep invocation condition and return payoff visible');
   for(const a of expected.abilities.filter(a=>a.fusionEvent))assert(text.includes(a.bodyText),'Keep fusion payment and reward together');
   for(const t of expected.tokens)assert(text.includes(t.name));
   if(expected.progressTransform){const formText=await page.evaluate(()=>tokenText(current.tokens.find(t=>t.upgrade)));assert(text.includes(formText));assert(text.includes('强化形态'));assert((await page.locator('#tokens').innerText()).includes('完成形'));}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.uncheck('#chaos');await page.fill('#name','全类型验证1343');await page.click('button[type=submit]');
  await page.screenshot({path:'C:/Users/29327/.codex/visualizations/2026/09/17/01a0b13a-8ee6-7e01-9c6e-e20bb5c5d64b/svwb-v4-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS: desktop/mobile, type filters, combined filters, name replay, clipboard, variants, safe text, hidden stats, no overflow or script errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
const {chromium}=require('playwright'),A=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const E=require('./engine.js'),root=path.resolve(__dirname,'..'),qa=path.join(__dirname,'qa');
function allCards(s){return [...s.board,...s.hand,...s.shop,...s.amulets,...s.opponents.flatMap(o=>o.board),...(s.result?.events||[]).flatMap(e=>e.boards.flat()),...(s.result?.survivors||[]).flat()];}
function legacy(s){s.evo=3;s.stats.evolutions=7;allCards(s).forEach(c=>c.evolved=true);return s;}
function clean(value){if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['evo','evolved','evolutions'].includes(k)).map(([k,v])=>[k,clean(v)]));return value;}
function assertClean(s){A(!Object.hasOwn(s,'evo'));A(!Object.hasOwn(s.stats,'evolutions'));allCards(s).forEach(c=>A(!Object.hasOwn(c,'evolved')));}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  const url=pathToFileURL(path.join(root,'sv_tavern.html')).href;await page.goto(url);
  A.equal(await page.evaluate(()=>TavernData.rulesVersion),require('./data.js').rulesVersion,'rebuild HTML before running this test');
  async function noEvolutionUI(){A.equal(await page.locator('[data-action="evolve"],.resources .energy,.card.evolved').count(),0);A(!/进化/.test(await page.locator('body').innerText()),'visible UI still advertises evolution');}
  async function noOverflow(){A(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'390px layout overflows horizontally');}
  async function importSave(s){A(E.validate(s));await page.locator('[data-action="menu"]').click();await page.locator('#save-file').setInputFiles({name:'legacy-evolution-save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await page.waitForFunction(()=>!document.querySelector('#save-file'));const saved=await page.evaluate(()=>TavernUI.getState());A.deepEqual(saved,E.normalize(clean(s)));assertClean(saved);return saved;}
  await page.locator('[data-action="start"]').click();await noEvolutionUI();
  await page.locator('[data-area="shop"]').first().click();await page.locator('.details [data-action="buy"]').click();await page.locator('.details [data-action="play"]').click();await page.locator('[data-area="board"]').first().click();await noEvolutionUI();
  for(const action of ['rules','builds']){await page.locator(`[data-action="${action}"]`).click();await noEvolutionUI();await page.locator('[data-action="close"]').click();}

  const recruit=E.create('haven',751290,'normal',['haven','royal','dragon','rune']);recruit.round=6;recruit.gold=10;recruit.tier=4;
  recruit.board=[E.make(recruit,'neutral0',{attack:44,health:61}),E.make(recruit,'forest0',{attack:21,health:34})];recruit.hand=[E.make(recruit,'evo')];recruit.amulets=[{...E.make(recruit,'bell'),count:2}];recruit.opponents[0].board=[E.make(recruit,'royal0',{attack:33,health:44})];legacy(recruit);
  await importSave(recruit);await page.locator(`[data-area="board"][data-card="${recruit.board[0].uid}"]`).click();A((await page.locator('.details .detail-sub').innerText()).includes('44 / 61'));await noEvolutionUI();
  await page.locator(`[data-area="hand"][data-card="${recruit.hand[0].uid}"]`).click();A((await page.locator('.details .detail-name').innerText()).includes('光明之路'));await page.locator('.details [data-action="play"]').click();A.equal(await page.locator('.target-banner').count(),0);const cast=await page.evaluate(()=>TavernUI.getState());A.deepEqual(cast.board.map(c=>[c.attack,c.health]),[[45,63],[22,36]]);A.equal(cast.spells,1);A.equal(cast.hand.length,0);assertClean(cast);await noEvolutionUI();
  await page.addInitScript(s=>localStorage.setItem('duskbound-tavern-save-v1',JSON.stringify(s)),recruit);await page.reload();await page.locator('[data-action="resume"]').click();const reloaded=await page.evaluate(()=>TavernUI.getState());assertClean(reloaded);A.deepEqual(reloaded.board,clean(recruit.board));await noEvolutionUI();

  await page.setViewportSize({width:390,height:844});await page.locator(`[data-area="board"][data-card="${recruit.board[0].uid}"]`).click();A(await page.locator('.mobile-inspect').isVisible());A((await page.locator('.mobile-inspect .detail-sub').innerText()).includes('44 / 61'));await noEvolutionUI();await noOverflow();fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'no-evolution.png'),fullPage:true});await page.locator('[data-action="clear-select"]').click();
  for(const action of ['rules','builds']){await page.locator(`[data-action="${action}"]`).click();await noEvolutionUI();await noOverflow();await page.locator('[data-action="close"]').click();}

  await page.setViewportSize({width:1440,height:1000});const result=E.create('haven',919151,'normal',['haven','royal','dragon','rune']);result.board=[E.make(result,'neutral0',{attack:300,health:500})];result.opponents.forEach(o=>o.hp=0);result.opponents[0].hp=1;result.opponent=0;A(E.act(result,'fight').ok);A.equal(result.rank,1);legacy(result);
  await importSave(result);await noEvolutionUI();A.deepEqual((await page.evaluate(()=>TavernUI.getState())).board.map(c=>[c.attack,c.health]),[[300,500]]);
  await page.locator('[data-action="replay"]').click();await page.locator('[data-action="pause"]').click();await noEvolutionUI();await page.locator('[data-action="skip"]').click();await page.locator('[data-action="continue"]').click();await page.getByRole('heading',{name:'获得冠军'}).waitFor();await noEvolutionUI();A((await page.locator('.record').innerText()).includes('三连'));await page.setViewportSize({width:390,height:844});await noOverflow();await noEvolutionUI();
  A.deepEqual(errors,[],'browser exceptions');A.deepEqual(external,[],'offline HTML must not request network resources');
  console.log('PASS no-evolution browser: new recruitment/details/rules/build guide/results, legacy recruit and result import, auto-load migration, preserved stats, untargeted Light path, replay, 390px layout, zero JS errors, zero external requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

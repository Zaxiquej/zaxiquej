const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/29327/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const S=require('./engine'),Q=require('./inspector-search');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/svwb_diy.html?inspector-test=514');
  await page.waitForFunction(()=>typeof iamkmr==='function');
  assert(!await page.locator('#inspector').isVisible());
  await page.locator('h1').click();await page.keyboard.type('iamkmr');
  assert(await page.locator('#inspector').isVisible());
  assert(await page.locator('#inspector-query').evaluate(n=>n===document.activeElement));
  await page.fill('#inspector-query','守护，入场曲');await page.fill('#inspector-exclude','疾驰');
  await page.selectOption('#inspector-type','follower');await page.selectOption('#inspector-limit','1000');
  await page.click('#inspector-start');await page.waitForFunction(()=>!document.getElementById('inspector-start').disabled,{},{timeout:60000});
  const cards=await page.evaluate(()=>SVWBInspector.getResults());assert(cards.length>0);
  const match=Q.compile({query:'守护，入场曲',exclude:'疾驰'});
  for(const c of cards){assert(match(c));assert.equal(c.type,'follower');assert.deepEqual(c,S.generate(c.name,{chaos:!!c.chaos}));}
  const downloadPromise=page.waitForEvent('download');await page.click('#inspector-export');
  const download=await downloadPromise;const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  assert.deepEqual(data.cards,JSON.parse(JSON.stringify(cards)));assert.equal(data.search.query,'守护，入场曲');
  await page.locator('#inspector-results button').first().click();assert(!await page.locator('#inspector').isVisible());
  assert.deepEqual(await page.evaluate(()=>current),cards[0]);
  await page.evaluate(()=>iamkmr());await page.fill('#inspector-query','绝不出现的测试文字_514');await page.selectOption('#inspector-limit','1000000');
  await page.click('#inspector-start');await page.waitForFunction(()=>document.getElementById('inspector-progress').value>0);
  await page.click('#inspector-stop');assert(await page.locator('#inspector-stop').isDisabled());
  assert((await page.locator('#inspector-status').innerText()).includes('已停止'));
  await page.click('#inspector-start');await page.keyboard.press('Escape');assert(!await page.locator('#inspector').isVisible());
  await page.setViewportSize({width:375,height:780});await page.fill('#name','iamkmr');
  assert(await page.locator('#inspector').isVisible());
  assert.equal(await page.locator('#name').inputValue(),cards[0].name);
  assert(await page.locator('#inspector').evaluate(n=>n.scrollWidth<=n.clientWidth));
  await page.fill('#inspector-query','');await page.fill('#inspector-exclude','');await page.click('#inspector-start');
  assert((await page.locator('#inspector-status').innerText()).includes('请输入'));
  await page.fill('#inspector-query','永远不匹配_514');await page.selectOption('#inspector-limit','1000');
  // Cheaply exhaust impossible header filters without generating a million cards.
  await page.selectOption('#inspector-type','amulet');await page.selectOption('#inspector-cost','7+');
  await page.click('#inspector-start');await page.waitForFunction(()=>!document.getElementById('inspector-start').disabled,{},{timeout:60000});
  assert((await page.locator('#inspector-status').innerText()).includes('本轮未命中'));
  assert.deepEqual(errors,[]);console.log('PASS: secret entry, console entry, worker matching, filters, replay, export, cancel/close, mobile, validation and no-match handling.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

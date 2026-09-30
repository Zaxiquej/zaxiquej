const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/29327/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const S=require('./engine'),Q=require('./inspector-search');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
async function collect(data){return new Promise((resolve,reject)=>{let cards=[];Q.scan(S,data,result=>{if(result.error)reject(Error(result.error));else{cards.push(...result.cards);if(result.done)resolve({cards,checked:result.checked,generated:result.generated});}});});}
(async()=>{
 for(let cls=0;cls<=7;cls++){
  const groups=Q.suggestions(S,cls),tokens=groups.find(g=>g.label.startsWith('衍生卡')).items;
  for(const t of [...S.TOKENS,...S.SUPPORT_CARDS])assert.equal(tokens.some(x=>x.label===t.name),t.class===0||t.class===cls);
 }
 assert(Q.suggestions(S).reduce((n,g)=>n+g.items.length,0)>100);
 assert(Q.compile({query:'『妖精』',scope:'all'})({abilities:[],tokens:[{name:'妖精',text:'【突进】'}]}));
 assert(!Q.compile({query:'『妖精』',scope:'all'})({abilities:[],tokens:[{name:'新绿的妖精',text:'【突进】'}]}));
 const data={options:{query:'守护',limit:100,maxResults:5,filters:{}},start:120,step:7};
 const scanned=await collect(data),expected=[];let checked=0;
 while(checked<100&&expected.length<5){const card=S.generate('随机卡牌#'+String(120+checked++*7).padStart(8,'0'));if(Q.compile(data.options)(card))expected.push(card);}
 assert.deepEqual(scanned.cards,expected);assert.equal(scanned.checked,checked);
 let emitted=false;const cancel=Q.scan(S,data,()=>emitted=true);cancel();await new Promise(r=>setTimeout(r,30));assert(!emitted);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const httpURL=`http://127.0.0.1:${server.address().port}/svwb_diy.html`;
  for(const mode of ['file','http','worker-throws','worker-error']){
   const page=await browser.newPage(),errors=[];let workers=0;
   page.on('pageerror',e=>errors.push(e.message));page.on('worker',()=>workers++);
   if(mode==='worker-throws')await page.addInitScript(()=>{window.Worker=class{constructor(){throw Error('blocked');}};});
   if(mode==='worker-error')await page.addInitScript(()=>{window.Worker=class{postMessage(){this.timer=setTimeout(()=>this.onerror?.({message:'blocked',preventDefault(){}}),0);}terminate(){clearTimeout(this.timer);}};});
   await page.goto(mode==='file'?pathToFileURL(path.join(root,'svwb_diy.html')).href:httpURL);
   await page.evaluate(()=>iamkmr());
   await page.selectOption('#inspector-class','3');
   assert(await page.locator('#inspector-chips button').filter({hasText:/^天晶魔手$/}).last().isVisible());
   assert.equal(await page.locator('#inspector-chips button').filter({hasText:/^悬丝傀儡$/}).count(),0);
   await page.locator('#inspector-chips button').filter({hasText:/^天晶魔手$/}).last().click();
   assert.equal(await page.inputValue('#inspector-query'),'『天晶魔手』');
   await page.selectOption('#inspector-class','7');assert.equal(await page.inputValue('#inspector-query'),'『天晶魔手』');
   assert.equal(await page.locator('#inspector-chips button').filter({hasText:/^天晶魔手$/}).count(),0);
   await page.selectOption('#inspector-chip-target','inspector-exclude');
   await page.locator('#inspector-chips button').filter({hasText:/^悬丝傀儡$/}).last().click();
   assert.equal(await page.inputValue('#inspector-exclude'),'『悬丝傀儡』');
   await page.selectOption('#inspector-class','');await page.fill('#inspector-query','守护');await page.fill('#inspector-exclude','');
   await page.selectOption('#inspector-limit','1000');await page.click('#inspector-start');
   await page.waitForFunction(()=>!document.getElementById('inspector-start').disabled,null,{timeout:60000});
   const cards=await page.evaluate(()=>SVWBInspector.getResults());assert(cards.length>0,mode+': '+await page.innerText('#inspector-status'));
   for(const card of cards){assert(Q.compile({query:'守护'})(card));assert.deepEqual(card,S.generate(card.name,{chaos:card.chaos}));}
   assert.equal(workers>0,mode==='http');
   const downloadPromise=page.waitForEvent('download');await page.click('#inspector-export');const download=await downloadPromise;
   assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(),'utf8')).cards,JSON.parse(JSON.stringify(cards)));
   await page.fill('#inspector-query','永不命中_本地回归');await page.selectOption('#inspector-limit','1000000');await page.click('#inspector-start');
   await page.waitForFunction(()=>document.getElementById('inspector-progress').value>0);await page.click('#inspector-stop');
   const progress=await page.locator('#inspector-progress').evaluate(n=>n.value);await page.waitForTimeout(80);
   assert.equal(await page.locator('#inspector-progress').evaluate(n=>n.value),progress);
   await page.click('#inspector-start');await page.keyboard.press('Escape');assert(!await page.locator('#inspector').isVisible());
   await page.setViewportSize({width:375,height:780});await page.evaluate(()=>iamkmr());await page.selectOption('#inspector-class','7');
   assert(await page.locator('#inspector').evaluate(n=>n.scrollWidth<=n.clientWidth));
   assert.deepEqual(errors,[]);await page.close();console.log('PASS: '+mode+' search, dynamic class/token chips, exclusions, reproducibility, export, cancellation, close and mobile layout');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());

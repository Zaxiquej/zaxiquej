'use strict';
const A=require('node:assert/strict'),{chromium}=require('playwright'),path=require('node:path'),{pathToFileURL}=require('node:url'),E=require('./engine'),D=require('./data');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(__dirname,'..','sv_tavern.html')).href);
 A.equal(await page.locator('#difficulty').count(),0);A((await page.locator('.armor-note').innerText()).includes('初始生命 30'));await page.locator('[data-action="start"]').click();
 const get=()=>page.evaluate(()=>TavernUI.getState()),fresh=await get();A([fresh,...fresh.opponents].every(p=>p.hp===30&&p.maxHp===30));A.equal(fresh.difficulty,'hard');A(!(await page.locator('.top-middle').innerText()).match(/悠闲|标准|挑战/));
 await page.locator('[data-action="rules"]').click();const rules=await page.locator('.modal').innerText();A(rules.includes('从 30 生命'));A(rules.includes('AI 第 2 回合'));A(!rules.match(/悠闲|标准|挑战/));await page.locator('.modal [data-action="close"]').click();
 const s=E.create('blood',9911,'hard',['blood','dragon','artifact','haven']);s.difficulty='easy';s.hp=40;s.maxHp=40;s.tier=6;s.bloodDamage=11;s.scrap=13;s.hand=[];s.shop=[];s.board=[E.make(s,'artifact9'),E.make(s,'dragon10',{attack:19,health:23}),E.make(s,'blood19'),E.make(s,'blood19',{golden:true})];s.opponents[0].hp=24;
 await page.locator('[data-action="menu"]').click();await page.locator('#save-file').setInputFiles({name:'distinctive.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await page.locator('.modal').waitFor({state:'detached'});
 A.equal((await get()).hp,30);A.equal((await get()).opponents[0].hp,24);A.equal((await get()).difficulty,'hard');
 const card=uid=>page.locator(`[data-area="board"][data-card="${uid}"]`),rule=()=>page.locator('.details .detail-text').innerText();
 await card(s.board[0].uid).click();A((await rule()).includes('无视守护'));A((await rule()).includes('+13 攻击'));A(!(await rule()).includes('顺劈'));
 await card(s.board[1].uid).click();A((await rule()).includes('+4 攻击 / +5 生命'));
 for(let i=2;i<=3;i++){await card(s.board[i].uid).click();A((await rule()).includes(i===2?'20/20':'35/35'));A((await card(s.board[i].uid).locator('.keywords').innerText()).includes('复仇 2'));A(!(await card(s.board[i].uid).locator('.keywords').innerText()).includes('谢幕'));const related=await page.locator('.details [data-related-id="bat"]').innerText();A(related.includes(i===2?'20 攻击 / 20 生命':'35 攻击 / 35 生命'));}
 await page.screenshot({path:path.join(__dirname,'qa','distinctive-desktop.png')});
 await page.locator('[data-action="catalog"]').click();for(const id of D.distinctiveIds){await page.locator(`.catalog-entry[data-id="${id}"]`).click();A((await page.locator('.catalog-rules').innerText()).includes(D.byId[id].text));if(id==='blood19')A((await page.locator('.catalog-related').innerText()).includes('4 攻击 / 4 生命'));await page.locator('[data-action="catalog-back"]').click();}await page.locator('.modal [data-action="close"]').click();
 await page.setViewportSize({width:390,height:1000});await card(s.board[3].uid).click();A((await page.locator('.mobile-inspect .detail-text').innerText()).includes('35/35'));A(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(__dirname,'qa','distinctive-mobile.png')});
 A.deepEqual(errors,[]);console.log('PASS no difficulty UI, eight 30-health heroes, rules, legacy import, three reworked cards, live golden bat previews, catalog and mobile; no AI games.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const S=require('./engine'),R=require('./reference.json'),assert=require('node:assert/strict'),fs=require('node:fs');
const zombie=S.TOKENS.find(t=>t.id===90051140),official=R.cards.find(t=>t.id===90051140);
for(const key of ['name','class','cost','attack','health','text'])assert.equal(zombie[key],official[key],key);
assert.equal(zombie.tribe,'亡者');assert(official.tribes.includes(zombie.tribeId));
assert(!S.TOKENS.find(t=>t.id===90051120).tribe);
assert(S.tokenValue(zombie)>S.tokenValue(S.TOKENS.find(t=>t.id===90031110)));
assert(S.tokenValue(zombie,'hand')<S.tokenValue(zombie));
const coverage={},examples={},timings=new Set(),tribal=new Set();let nightmare=0,zombies=0,linked=0;
for(let i=0;i<20000;i++){
 const c=S.generate('僵尸体系'+i);if(c.class===5)nightmare++;
 const hasZombie=c.tokens.some(t=>t.id===zombie.id);
 if(c.class===5)for(const a of c.abilities)for(const id of a.ids.filter(id=>id.startsWith('tribe')))tribal.add(id);
 if(!hasZombie)continue;
 zombies++;assert.equal(c.class,5);assert.deepEqual(c,S.generate(c.name));
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.011,c.name);
 const texts=[...c.abilities,...c.emblems,...c.alternateForms.flatMap(f=>f.abilities||[])];
 for(const a of texts.filter(a=>a.text.includes('腐臭的僵尸'))){
  if(/召唤[^。]*腐臭的僵尸/.test(a.text)){coverage.summon=(coverage.summon||0)+1;examples.summon??=c.name;}
  if(/将[^。]*腐臭的僵尸[^。]*加入手牌/.test(a.text)){coverage.hand=(coverage.hand||0)+1;examples.hand??=c.name;}
  if(a.trigger)timings.add(a.trigger);
 }
 if(c.abilities.some(a=>a.text.includes('亡者·随从'))||c.emblems.some(e=>e.text.includes('亡者·随从'))){linked++;examples.linked??=c.name;}
 for(const e of c.emblems.filter(e=>e.eventId==='tribeEnter'))assert(!e.effects.some(p=>p.produces.includes('enter')));
}
assert(coverage.summon>10&&coverage.hand>10);assert(linked>0);assert(timings.has('入场曲')&&timings.has('谢幕曲')&&timings.has('进化时'));
for(const id of ['tribeSupply','tribeBuff','tribeEngine'])assert(tribal.has(id),id);
assert(zombies/nightmare>.01&&zombies/nightmare<.3);
const report={version:S.VERSION,total:20000,nightmare,zombies,linked,coverage,timings:[...timings],tribal:[...tribal],examples};
fs.writeFileSync(__dirname+'/zombie-validation.json',JSON.stringify(report,null,2));console.log('PASS: official zombie, delivery pricing, undead membership, modular supply/summon and synergy, budgets and loop guards.');console.log(report);

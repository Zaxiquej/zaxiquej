const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),P=S.PREVIEW;
assert.equal(P.rabbit.class,6);assert.equal(P.rabbit.cost,2);
assert.match(P.rabbit.text,/进入战场时.*自己的手牌中的随机1张费用最小/);
assert(!P.rabbit.text.includes('【入场曲】'));assert(!P.rabbit.text.includes('若以此'));
assert.equal(P.rabbit.entryStats,6);assert(S.tokenValue(P.rabbit)>6);
assert.equal(P.affinity([{ids:['rabbitSummon']}],['evidenceHand']),4);
assert.equal(P.affinity([{ids:['ownBanish']}],['evidenceHand']),3);
assert(S.strategyAffinity(['banishBoard'],['evidence'])>S.strategyAffinity(['experiment'],['crystalHands']));
const counts={},samples={},stats={cards:0,rabbitSources:0,rabbitCrests:0,rabbitHand:0,evidenceHand:0,evidenceDeath:0,banishEngines:0,banishCrests:0,banishSupplied:0,rabbitSupplied:0},payoffs=new Set();
const record=(key,c)=>{counts[key]=(counts[key]||0)+1;samples[key]??={name:c.name,class:c.class,rarity:c.rarity,cost:c.cost,type:c.type,body:[c.attack,c.health],text:c.abilities.map(a=>a.text),emblems:c.emblems};};
for(let i=0;stats.cards<6000&&i<60000;i++){
 const name='预览体系'+i,h=S.header(name);
 if(stats.cards>=3000&&![5,6].includes(h.class))continue;
 const c=S.generate(name);stats.cards++;
 require('./assert-node-effects.cjs')(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 assert(S.boardCapacity(c).valid,c.name+' capacity');
 const ids=c.abilities.flatMap(a=>a.ids),crestIds=c.emblems.flatMap(e=>e.effects.map(p=>p.id));
 if(ids.includes('evidenceHand')){stats.evidenceHand++;record('evidenceHand',c);}
 if(c.abilities.some(a=>a.trigger==='谢幕曲'&&a.ids.includes('evidenceHand'))){stats.evidenceDeath++;record('evidenceDeath',c);}
 if(ids.includes('rabbitSummon')){stats.rabbitSources++;record('rabbitSummon',c);}
 if(ids.includes('rabbitHand')){stats.rabbitHand++;record('rabbitHand',c);}
 if(crestIds.includes('rabbitSummon')){stats.rabbitCrests++;record('rabbitCrest',c);}
 if(ids.some(id=>/^rabbit/.test(id))||crestIds.some(id=>/^rabbit/.test(id))){
  assert.equal(c.class,6);assert(c.tokens.some(t=>t.id===P.rabbit.id));
  if(ids.includes('evidenceHand')||crestIds.includes('evidenceHand')){stats.rabbitSupplied++;record('rabbitSupplied',c);}
 }
 for(const a of c.abilities){
  if(a.ids.includes('rabbitSummon')){
   assert(a.raw>=S.tokenValue(P.rabbit),c.name+' rabbit priced as printed 1/1');
   if(a.summonDelivery)assert.equal(a.summonDelivery.stats,a.summonDelivery.count*6);
   if(a.summonGrants){assert(a.summonGrants.attack>=3);assert(!a.summonGrants.grants.some(g=>g.id==='summonRush'));}
  }
  if(a.ids.includes('ownBanish')){
   stats.banishEngines++;record('banishEngine',c);assert.equal(c.class,5);
   assert.match(a.text,/自己的卡牌在战场上消失时，若为自己的回合，则/);
   assert(!a.text.includes('选择'));assert.equal(a.banishEvent.zone,'board');
   a.ids.filter(id=>id!=='ownBanish').forEach(id=>payoffs.add(id));
   assert(!a.ids.some(id=>['evidenceSummon','ghostSummon'].includes(id)),'No recursively self-feeding banish summon');
  }
 }
 for(const e of c.emblems.filter(e=>e.eventId==='ownBanish')){
  stats.banishCrests++;record('banishCrest',c);assert.equal(c.class,5);
  assert.match(e.text,/若为自己的回合/);assert(!e.text.includes('选择'));
  assert(!e.effects.some(p=>['summon','ghostSummon','evidenceSummon'].includes(p.id)));
 }
 if(ids.includes('ownBanish')||c.emblems.some(e=>e.eventId==='ownBanish')){
  const supply=c.abilities.some(a=>a.ids.some(id=>['evidenceHand','evidenceSummon','ghostSummon','tokenSummon'].includes(id))&&a.tokens?.some(t=>t.id===P.evidence.id||t.id===90051130));
  if(supply){stats.banishSupplied++;record('banishSupplied',c);}
 }
 if(stats.cards%1000===0)assert.deepEqual(c,S.generate(name));
}
console.log({version:S.VERSION,stats,payoffs:[...payoffs]});
for(const key of ['rabbitSources','rabbitCrests','rabbitHand','evidenceDeath','banishEngines','banishCrests','banishSupplied','rabbitSupplied'])assert(stats[key]>0,key+' unreachable');
assert(payoffs.size>=3,'Banish trigger is not a fixed heal package');
fs.writeFileSync(__dirname+'/preview-systems-validation.json',JSON.stringify({version:S.VERSION,stats,payoffs:[...payoffs],samples},null,2));

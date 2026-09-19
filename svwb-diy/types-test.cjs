const assert=require('node:assert/strict'),fs=require('node:fs');
const S=require('./engine.js');
const counts={follower:0,spell:0,amulet:0},coverage={faith:0,selfCopy:0,storm:0,cheapStorm:0,countdown:0,permanent:0,activation:0,paidAct:0,freeAct:0,breakAct:0,repeatAct:0,acceleration:0,actReplay:0,spellMode:0,amuletMode:0,spellEnhance:0,amuletEnhance:0,spellboost:0,spellEmblem:0,amuletEngine:0,soil:0,zeroAmulet:0};
const examples={},structures={spell:new Set(),amulet:new Set()},spending={spell:[0,0,0],amulet:[0,0,0]};
function hit(key,name){coverage[key]++;examples[key]||=name;}
for(let i=0;i<60000;i++){
 const c=S.generate('全类型验证'+i);counts[c.type]++;
 assert.deepEqual(c,S.generate(c.name),'Seed determinism');
 assert(c.abilities.length<=5&&c.spent<=c.budget+.011);
 const ids=c.abilities.flatMap(a=>a.ids);require('./assert-node-effects.cjs')(c);
 if(c.type==='follower'){
  assert(c.attack>=0&&c.health>=1);if(c.attack===0)assert(c.zeroAttackTrade&&c.cost<=3);
  if(c.faiths.length){hit('faith',c.name);assert.equal(c.rarity,3);}
  if(ids.includes('疾驰')){
   hit('storm',c.name);if(c.cost<=3)hit('cheapStorm',c.name);
   const a=c.abilities.find(a=>a.ids.includes('疾驰'));
   assert(a.price+1e-8>=S.keywordPrice('疾驰',c.attack,c.health),'Storm must pay for actual attack');
  }
  if(ids.includes('selfCopy')){
   hit('selfCopy',c.name);
   for(const a of c.abilities.filter(a=>a.ids.includes('selfCopy'))){
    assert(a.text.includes(`『${c.name}』`));
    if(a.trigger==='谢幕曲')assert(a.text.includes('失去【谢幕曲】'));
    assert(['入场曲','进化时','超进化时','谢幕曲','爆能强化'].includes(a.trigger));
   }
  }
  continue;
 }
 assert.equal(c.attack,null);assert.equal(c.health,null);assert.equal(c.faiths.length,0);
 assert(c.abilities.some(a=>a.trigger));assert.equal(c.alternateForms.length,0);
 assert(!c.abilities.some(a=>['进化时','超进化时','攻击时'].includes(a.trigger)));
 for(const a of c.abilities){
  assert(Number.isFinite(a.raw)&&Number.isFinite(a.price)&&a.price>=0);
  assert(!a.text.includes('本随从'));
  if(a.minPayoff)assert(a.raw+1e-8>=a.minPayoff);
  if(a.trigger==='谢幕曲')assert(!a.text.includes('选择')&&!a.text.includes('【模式】'));
  if(a.ids.includes('boardWipe')){
   const previous=c.abilities.slice(0,c.abilities.indexOf(a));
   assert(!previous.some(p=>(p.trigger===a.trigger||(a.trigger==='爆能强化'&&['法术','入场曲'].includes(p.trigger)))&&p.ids.some(id=>['tokenSummon','crystalHandSummon','reanimate','recruit','artifactCopy','allyBuff','teamBuff','grantRush','grantWard','grantBarrier'].includes(id))),'Do not wipe immediately after summoning or buffing allies');
  }
  for(const t of a.tokens||[])assert(c.tokens.some(v=>v.id===t.id));
 }
 if(c.type==='spell'){
  assert(c.cost>=1);assert(c.abilities.some(a=>a.trigger==='法术'));
  assert(c.abilities.every(a=>['法术','爆能强化','魔力增幅时'].includes(a.trigger)||a.trigger==='在手牌中发动'&&(a.kind==='handTrigger'&&a.handSpec.payoff==='discount'||a.kind==='progressTransform'&&a.progression)||a.trigger==='本卡牌被舍弃时'&&c.class===4&&a.ids.includes('discardTrigger')));
  if(c.abilities.some(a=>a.mode))hit('spellMode',c.name);
  if(c.abilities.some(a=>a.enhanceCost))hit('spellEnhance',c.name);
  if(ids.includes('spellboostDiscount'))hit('spellboost',c.name);
  if(c.emblems.length)hit('spellEmblem',c.name);
 }else{
  if(c.countdown===null)hit('permanent',c.name);
  else {hit('countdown',c.name);assert(c.abilities.some(a=>a.text===`【吟唱 ${c.countdown}】`));}
  if(c.cost===0)hit('zeroAmulet',c.name);
  if(ids.includes('earthSigil')){hit('soil',c.name);assert.equal(c.class,3);assert.equal(c.countdown,null);assert(!c.abilities.some(a=>a.activation?.breaksSelf||a.trigger==='启动'&&/破坏本(?:卡牌|护符)/.test(a.text)),c.name+' earth sigil activation cannot self-destruct');}
  if(ids.includes('amuletEngine'))hit('amuletEngine',c.name);
  if(c.abilities.some(a=>a.mode))hit('amuletMode',c.name);
  if(c.abilities.some(a=>a.enhanceCost))hit('amuletEnhance',c.name);
  for(const a of c.abilities.filter(a=>a.trigger==='启动')){
   hit('activation',c.name);assert(a.activation.oncePerTurn);
   const ac=a.activation;hit(ac.fee?'paidAct':'freeAct',c.name);hit(ac.breaksSelf?'breakAct':'repeatAct',c.name);
   if(ac.fee)assert(a.text.startsWith(`费用${ac.fee}【启动】`));
   if(c.cost===0)assert(ac.breaksSelf&&ac.fee>=1);
   if(ac.breaksSelf)assert(a.text.includes('破坏本卡牌'));
   if(ac.countdownReduction){hit('acceleration',c.name);assert(c.countdown!==null);assert(c.abilities.some(v=>v.trigger==='谢幕曲'));}
   if(a.ids.includes('activationReplay')){
    hit('actReplay',c.name);const fans=c.abilities.filter(a=>a.trigger==='入场曲');assert(fans.length);
    assert(a.raw+1e-8>=fans.reduce((s,a)=>s+a.raw,0));
   }
   assert(a.raw<=a.price/(ac.repeats||1)+ac.credit+.001,'Activation must price extra PP independently');
  }
 }
 for(const e of c.emblems)assert(c.abilities.some(a=>a.emblemIds?.includes(e.id)));
 structures[c.type].add(c.abilities.map(a=>a.trigger+':'+a.ids.join('+')).join('|'));
 spending[c.type][0]+=c.spent/c.budget;spending[c.type][1]++;
 if(c.cost>=7&&c.spent/c.budget<.5)spending[c.type][2]++;
}
for(const [type,ratio]of Object.entries({follower:.6,spell:.2,amulet:.2}))assert(Math.abs(counts[type]/60000-ratio)<.015);
assert(coverage.faith/counts.follower<.01&&coverage.faith>20);
assert(coverage.selfCopy>coverage.faith*5&&coverage.selfCopy/counts.follower>.02);
assert(coverage.storm/counts.follower>.05&&coverage.storm/counts.follower<.11);assert(coverage.cheapStorm>50);
assert(S.keywordPrice('疾驰',9,9)-S.keywordPrice('疾驰',8,8)>S.keywordPrice('疾驰',3,3)-S.keywordPrice('疾驰',2,2));
for(const [key,value]of Object.entries(coverage))assert(value>0,key+' unreachable');
for(const type of ['spell','amulet'])assert(structures[type].size>250,'Non-followers need recombination');
for(const type of ['spell','amulet'])assert.equal(spending[type][2],0,'High-cost cards must use their effect allowance');
assert(coverage.activation/counts.amulet>.68&&coverage.activation/counts.amulet<.85,'Activation should not be mandatory');
const report={version:S.VERSION,counts,coverage,rates:{faith:coverage.faith/counts.follower,selfCopy:coverage.selfCopy/counts.follower,storm:coverage.storm/counts.follower},structures:Object.fromEntries(Object.entries(structures).map(([t,s])=>[t,s.size])),budgetUse:Object.fromEntries(Object.entries(spending).map(([t,s])=>[t,{mean:s[0]/s[1],highCostBelowHalf:s[2]}])),examples};
fs.writeFileSync(__dirname+'/types-validation.json',JSON.stringify(report,null,2));
console.log('PASS: 60,000 seeds; types, frequency calibration, real-attack Storm cost, activation timing/credit, clone loops, references and recombination.');console.log(report);

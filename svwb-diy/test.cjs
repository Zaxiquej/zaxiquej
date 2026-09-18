const assert = require('node:assert/strict');
const {generate,nextVariant,randomName,TOKENS,keywordPrice,tokenValue}=require('./engine.js');
const ref=require('./reference.json');
// Official token descriptions and stats must remain faithful to the frozen snapshot.
for(const t of TOKENS){const c=ref.cards.find(c=>c.id===t.id);for(const k of ['name','cost','attack','health','class','text'])assert.equal(t[k],c[k]);}
assert.throws(()=>generate('   '));
assert.deepEqual(generate('诗篇'),generate('  诗篇  '));
assert.deepEqual(generate('é'),generate('e\u0301'));
assert.equal(nextVariant('设计师您辛苦了',()=>0),'设计师您辛苦了#000000');
assert.equal(nextVariant('设计师您辛苦了#000000',()=>0),'设计师您辛苦了#000001');
assert.equal(nextVariant('随从#999999',()=>.999999999),'随从#999998');
assert.equal(nextVariant('随从#1234',()=>0),'随从#000000');
assert.equal(nextVariant('随从#12',()=>0),'随从#000000');
assert.equal(nextVariant('   ',()=>0),'设计师您辛苦了#000000');
assert.equal(randomName(()=>0),'随机卡牌#00000000');
assert.equal(randomName(()=>.999999999),'随机卡牌#99999999');
assert.equal(nextVariant('随机卡牌#00000000',()=>0),'随机卡牌#00000001');
assert.equal(keywordPrice('守护',10,10),0);
assert.equal(keywordPrice('突进',10,10),0);
assert(keywordPrice('毁灭',1,2)>keywordPrice('毁灭',7,7));
assert(keywordPrice('虹吸',1,2)<keywordPrice('虹吸',7,7));
assert(keywordPrice('虹吸',7,7,{attacks:2})>keywordPrice('虹吸',7,7));
assert(tokenValue(TOKENS[10])>tokenValue(TOKENS[2])*4);
assert(tokenValue(TOKENS[10])>tokenValue(TOKENS[10],'hand')*3);
const long=nextVariant('😀'.repeat(24),()=>.999999);
assert(long.length<=48&&long.endsWith('#999999')&&long.isWellFormed());
assert.notEqual(generate('随从#000000').seed,generate('随从#000001').seed);
let variant='随从';
for(let i=0;i<100;i++){const next=nextVariant(variant);assert.match(next,/^随从#\d{6}$/);assert.notEqual(next,variant);variant=next;}
let blank=0,modes=0,replays=0,enhance=0,custom=0,statics=0;
let tokenCards=0,customHandCards=0;
const enhanceBands=[[],[],[]];let compoundEnhance=0;
const coverage={emblems:0,fusion:0,accelerate:0,crystallize:0,search:0,draw2:0,draw3:0,largeNecro:0,colossal:0,keyword:0,faith:0,crystalHands:0,handLinks:0,handDiscount:0};
const examples={},emblemClasses=new Set(),signatures=new Set();
const assemblies=new Map();
const emblemDurations=new Map();
const distribution={highDraw:[0,0,0,0],emblems:{},highCards:0,highTrades:0,bodySums:new Map()};
const rarities=Array.from({length:4},()=>({n:0,abilities:0}));
for(let i=0;i<30000;i++) {
 const c=generate(`校验种子${i}`);
 if(c.type!=='follower')continue;
 assert.deepEqual(c,generate(`校验种子${i}`));
 assert(c.attack>=0&&c.health>=1&&c.cost>=1&&c.cost<=10);if(c.attack===0)assert(c.zeroAttackTrade&&c.cost<=3);
 assert(c.attack+c.health+c.spent<=c.budget+.01);
 assert(c.abilities.length<=5);
 if(!distribution.bodySums.has(c.cost))distribution.bodySums.set(c.cost,new Set());
 distribution.bodySums.get(c.cost).add(c.attack+c.health);
 if(c.cost>=7){distribution.highCards++;if(c.bodyTrade)distribution.highTrades++;}
 if(c.bodyTrade){assert(c.bodyTrade.lost>=2);assert(c.bodyTrade.payoffRaw>=c.bodyTrade.lost+(c.cost<=3?0:2));assert(c.abilities.some(a=>a.kind==='bodyPayoff'&&a.trigger==='入场曲'&&a.raw===c.bodyTrade.payoffRaw));if(c.cost<=3)assert.equal(c.abilities.find(a=>a.kind==='bodyPayoff').ids.filter(id=>id!=='bodyPayoff').length,1);}
 if(c.cost===2&&!c.signature)assert(c.attack+c.health>=(c.zeroAttackTrade?1:c.boardBodyTrade||c.stormBodyTrade||c.bodyTrade||c.resourceBodyTrade?2:4));
 if(c.fusion){coverage.fusion++;assert(c.abilities.some(a=>a.kind==='fusion'&&a.text.includes(c.fusion.material)));examples.fusion||=c.name;}
 for(const f of c.alternateForms){assert(f.cost<c.cost);coverage[f.kind==='结晶'?'crystallize':'accelerate']++;assert(c.abilities.some(a=>a.kind==='alternate'));if(f.kind==='结晶'){assert(f.countdown>=2);assert(f.text.includes('【谢幕曲】召唤'));}examples[f.kind]||=c.name;}
 if(c.signature){signatures.add(c.archetype);assert(c.rarity===3&&c.cost>=7);examples[c.archetype]||=c.name;if(!assemblies.has(c.archetype))assemblies.set(c.archetype,new Set());assemblies.get(c.archetype).add(c.abilities.map(a=>a.text.replaceAll(c.name,'NAME')).join('\n'));}
 for(const d of c.dependencies||[]){assert(c.abilities.some(a=>a.ids.includes(d.ability)));assert(c.abilities.some(a=>a.ids.includes(d.requires)));}
 if(c.emblems.length){coverage.emblems++;emblemClasses.add(c.class);examples.emblem||=c.name;}
 for(const e of c.emblems){
  assert(c.abilities.some(a=>a.emblemIds?.includes(e.id)));
  emblemDurations.set(e.duration,(emblemDurations.get(e.duration)||0)+1);
  if(e.duration===null){assert(!/^【吟唱 \d+】/.test(e.text));examples.permanentEmblem||=c.name;}
  else {assert([2,3,4,5].includes(e.duration));assert(e.text.startsWith(`【吟唱 ${e.duration}】`));}
 }
 for(const f of c.faiths){coverage.faith++;assert.equal(f.initial,0);assert.equal(f.start,'battle');assert([1,2,3,5,6].includes(c.class));assert(c.abilities.some(a=>a.faithIds?.includes(f.id)));assert(f.text.includes('信仰值+1'));examples.faith||=c.name;}
 if(c.archetype==='colossalRemoval'){coverage.colossal++;assert(c.attack+c.health+(c.stormBodyTrade?.attackLost||0)+(c.stormBodyTrade?.healthLost||0)>=20);examples.colossal||=c.name;}
 if(c.abilities.some(a=>a.kind==='keyword'))coverage.keyword++;
 const ids=c.abilities.flatMap(a=>a.ids);
 assert.equal(ids.length,new Set(ids).size);
 assert(!(ids.includes('疾驰')&&ids.includes('突进')));
 assert(!(ids.includes('疾驰')&&ids.includes('doubleAttack')));
 assert(!(ids.includes('潜行')&&ids.includes('守护')));
 if(ids.includes('疾驰'))assert(c.attack<=Math.max(1,c.cost-1));
 for(const a of c.abilities){
  assert(!a.text.includes('若自己没有『纹章：'));
  if(a.kind==='faithPayoff'){assert(c.faiths.some(f=>a.faithIds.includes(f.id)));assert(a.faithSpend.amount>0&&a.faithSpend.unbounded);assert(a.text.includes('消耗'));}
  if(a.ids.some(id=>id.startsWith('crystalHand'))){coverage.crystalHands++;assert.equal(c.class,3);assert(c.tokens.some(t=>t.id===10631110));examples.crystalHands||=c.name;}
  if(a.ids.includes('crystalHandLink')){coverage.handLinks++;assert(c.abilities.some(b=>b.ids.includes('crystalHandSupply')||b.ids.includes('crystalHandSummon')));examples.handLink||=c.name;}
  if(a.ids.includes('crystalHandCostReduction')){coverage.handDiscount++;assert(c.cost>=7&&c.attack+c.health<=10);examples.handDiscount||=c.name;}
  if(c.cost>=7)for(const m of a.text.matchAll(/抽取([123])张卡牌/g))distribution.highDraw[Number(m[1])]++;
  if(a.kind==='emblem')distribution.emblems[a.trigger]=(distribution.emblems[a.trigger]||0)+1;
  if(a.kind==='replay'){replays++;assert(c.abilities.some(b=>b.trigger==='入场曲'));}
  if(a.kind==='mode'){modes++;assert(a.text.includes('（1）')&&a.text.includes('（2）'));}
  if(a.kind==='static')statics++;
  if(a.trigger==='爆能强化'){
   enhance++;const n=Number(a.text.match(/强化 (\d+)/)[1]);assert(n>c.cost&&n<=10);
   assert.equal(a.enhanceCost,n);enhanceBands[n<=6?0:n<=8?1:2].push(a.raw);
   if(n>=7){assert(a.raw>=6+(n-6)*2);if(a.ids.length>2)compoundEnhance++;}
  }
  if(a.condition==='combo'){assert.equal(c.class,1);assert(c.cost<=5);}
  if(a.condition==='forestHistory'){assert.equal(c.class,1);assert(c.cost>=6);}
  if(a.condition==='overflow')assert.equal(c.class,4);
  if(a.condition==='necromancy')assert.equal(c.class,5);
  if(a.condition==='necromancy')assert(!a.ids.includes('grave'));
  if(a.condition==='earth')assert(!a.ids.includes('earth'));
  if(a.trigger==='入场曲'&&a.condition==='none')assert(!a.ids.includes('buff'),'Unconditional Fanfare self-buff');
  if(a.trigger==='谢幕曲'){
   assert(!a.ids.includes('buff'));
   assert.notEqual(a.kind,'mode');
   assert(!a.text.includes('选择')&&!a.text.includes('【模式】'),'Last Words must resolve without player choices');
  }
  if(a.ids.includes('keywordSearch')||a.ids.includes('typeSearch'))coverage.search++;
  if(a.text.includes('抽取2张卡牌'))coverage.draw2++;
  if(a.text.includes('抽取3张卡牌'))coverage.draw3++;
  if(a.minPayoff)assert(a.raw+1e-8>=a.minPayoff);
  if(a.resourceCost>=8){coverage.largeNecro++;assert(a.raw>=a.resourceCost);examples.necro||=c.name;}
  if(a.ids.includes('ramp'))assert((a.enhanceCost||c.cost)>=3&&c.class===4);
  if(a.ids.includes('costReduction'))assert(c.cost>=8&&c.class===3&&c.attack+c.health<=10);
  if(c.cost<=2&&a.trigger==='入场曲'&&a.condition==='none')assert(!a.ids.some(id=>['destroy','banish','ramp','reanimate'].includes(id)));
  for(const t of a.tokens||[])assert(c.tokens.some(x=>x.id===t.id));
 }
 // A single compound Fanfare can already summon two upgraded artifacts and draw two.
 if(c.cost>=6){assert(c.abilities.some(a=>a.major));assert(c.corePower>=8);}
 if(c.vanilla){blank++;assert(c.rarity===0&&c.cost<=4);}
 else assert(c.abilities.some(a=>a.trigger),'Non-vanilla must have a triggered effect');
 if(c.tokens.length)tokenCards++;
 if(c.tokens.some(t=>t.custom))custom++;
 for(const t of c.tokens.filter(t=>t.custom)){
  if(c.abilities.some(a=>a.text.includes(`『${t.name}』加入手牌`))){
   customHandCards++;
   assert(t.attack+t.health>t.cost*2,'Generated hand rewards need above-rate bodies');
   assert(t.text.length>0,'Generated hand rewards should retain an ability');
   // Do not increase a low-attack reward's attack: double attack is priced by it.
   const ordinary={...t,attack:Math.min(t.attack,t.cost),health:t.cost*2-Math.min(t.attack,t.cost)};
   assert(tokenValue(t,'hand')>tokenValue(ordinary,'hand'),'Reward efficiency must be charged to its source');
  }
 }
 rarities[c.rarity].n++;rarities[c.rarity].abilities+=c.abilities.length;
}
assert(blank>0&&blank<300);assert(modes>500&&replays>50&&enhance>100&&custom>100&&statics>20);
assert(customHandCards>20,'Generated hand rewards should remain obtainable');
assert(custom/tokenCards<.15,'Existing tokens should be substantially more common');
const enhanceMeans=enhanceBands.map(values=>{assert(values.length>20);return values.reduce((s,n)=>s+n,0)/values.length;});
assert(enhanceMeans[0]<enhanceMeans[1]&&enhanceMeans[1]<enhanceMeans[2],'Enhancement payoff should grow with the actual paid cost');
assert(compoundEnhance>50,'Expensive enhancement should include compound effects');
for(const [k,n]of Object.entries(coverage))assert(n>0,k+' missing');
assert.equal(emblemClasses.size,8);assert.equal(signatures.size,5);
for(const duration of [null,2,3,4,5])assert(emblemDurations.get(duration)>0);
const permanentShare=emblemDurations.get(null)/coverage.emblems;
assert(permanentShare>.15&&permanentShare<.6,'Both permanent and countdown emblems must remain obtainable');
for(const [kind,variants]of assemblies)assert(variants.size>=3,kind+' must recompose, not repeat one fixed recipe');
const draws=distribution.highDraw.reduce((a,b)=>a+b,0),emblems=Object.values(distribution.emblems).reduce((a,b)=>a+b,0);
assert(distribution.highDraw[3]/draws<.4,'High-cost resource effects must not collapse to draw three');
assert(distribution.highDraw[1]/draws>.2);
assert(distribution.emblems['入场曲']/emblems>.18,'Reserve enough budget for Fanfare emblems');
assert(distribution.highTrades/distribution.highCards>.08&&distribution.highTrades/distribution.highCards<.35);
for(const cost of [3,4,5,6,7,8,9,10])assert(distribution.bodySums.get(cost).size>=3,'Body sums should vary at cost '+cost);
const means=rarities.map(r=>r.abilities/r.n);for(let i=1;i<4;i++)assert(means[i]>means[i-1]);
console.log('PASS: 30,000 seeds; deterministic, legal budgets, class gates, modes, replays, token fidelity.');
console.log({blank,modes,replays,enhance,custom,statics,meanAbilitiesByRarity:means});
console.log({tokenCards,customTokenCardShare:custom/tokenCards,customHandCards});
console.log({enhanceCounts:enhanceBands.map(v=>v.length),enhanceMeans,compoundEnhance});
console.log({coverage,examples,signatures:[...signatures]});
console.log({emblemDurations:Object.fromEntries(emblemDurations)});

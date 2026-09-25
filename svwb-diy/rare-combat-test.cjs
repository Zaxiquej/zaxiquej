const assert=require('node:assert/strict'),{generate,randomMatchingName,keywordPrice,multipleAttackPrice,stormCardValue}=require('./engine');
const wanted=['abilityDestructionImmune','combatDestroy','tripleAttack','damageCap','reduceDamage'];
const counts=Object.fromEntries(wanted.map(id=>[id,0])),examples={},companions=new Set();
const attackTimings=new Set(),attackCompanions=new Set();
assert(keywordPrice('灵气',6,6,{protected:true})>keywordPrice('灵气',6,6));
assert.equal(keywordPrice('虹吸',6,6,{attacks:3}),keywordPrice('虹吸',6,6)*3);
assert(multipleAttackPrice(2,3)<multipleAttackPrice(7,3));
assert(multipleAttackPrice(8,3)-multipleAttackPrice(7,3)>multipleAttackPrice(3,3)-multipleAttackPrice(2,3));
const triple={kind:'static',trigger:'',ids:['tripleAttack'],raw:14,price:14};
assert.equal(stormCardValue(7,5,[]).value,8);
assert(stormCardValue(2,12,[triple]).value<=10,'Low individual attack can support three Storm attacks');
assert(stormCardValue(7,5,[triple]).value>20,'Three high-attack Storm hits are not priced as one');
assert(stormCardValue(3,5,[triple]).value-stormCardValue(2,5,[triple]).value>stormCardValue(3,5,[]).value-stormCardValue(2,5,[]).value);
for(let i=0;i<30000;i++){
 const c=generate('虹卡拆解'+i),ids=c.abilities.flatMap(a=>a.ids);
 if(!wanted.some(id=>ids.includes(id)))continue;
 assert.deepEqual(c,generate(c.name));
 assert.equal(c.type,'follower');assert(c.rarity>=2&&c.cost>=3);
 assert(c.attack+c.health+c.spent<=c.budget+.01);assert(c.abilities.length<=5);
 for(const id of wanted)if(ids.includes(id)){counts[id]++;examples[id]??=c.name;}
 companions.add(c.abilities.map(a=>a.ids.join(',')).join('|'));
 assert(wanted.filter(id=>['abilityDestructionImmune','damageCap','reduceDamage'].includes(id)&&ids.includes(id)).length<=1);
 if(ids.includes('combatDestroy')){const a=c.abilities.find(a=>a.ids.includes('combatDestroy'));assert.equal(a.trigger,'交战时');assert.equal(a.bodyText,'破坏交战对手。');assert(a.price>=a.raw*1.6);}
 if(ids.includes('tripleAttack')){
  assert(c.rarity===3&&c.cost>=7);assert(!ids.some(id=>['doubleAttack','handStorm'].includes(id)));
  const a=c.abilities.find(a=>a.ids.includes('tripleAttack'));
  assert(['','进化时','超进化时'].includes(a.trigger));attackTimings.add(a.trigger);
  const factor=a.trigger==='超进化时'?.5:a.trigger==='进化时'?.7:1;
  assert(Math.abs(a.price-a.raw*factor)<1e-8);
  assert.equal(a.price,multipleAttackPrice(c.attack,3,a.trigger));
  assert.equal(a.bodyText,a.trigger?'本随从获得「1回合可以攻击3次」。':'1回合可以攻击3次。');
  assert(!('keywordReprices' in a),'No internal ability references in public card data');
  if(ids.some(id=>['疾驰','selfEvolve','selfSuperEvolve'].includes(id)))assert.equal(a.trigger,'');
  if(ids.includes('疾驰')){assert(c.cost>=8);assert(stormCardValue(c.attack,c.health,c.abilities).value<=c.cost+.01);assert.equal(c.abilities.find(a=>a.ids.includes('疾驰')).price,keywordPrice('疾驰',c.attack,c.health,{attacks:3}));}
  attackCompanions.add(c.abilities.filter(b=>b!==a).flatMap(b=>b.ids).sort().join(','));
  for(const b of c.abilities.filter(a=>a.attackMultiplicity===3))assert.equal(b.price,b.singleAttackPrice*3);
  for(const b of c.abilities.filter(a=>['攻击时','交战时'].includes(a.trigger)&&a.condition==='none'))assert(b.price>=b.raw*(b.trigger==='交战时'?1.6:1.15)*3-1e-8);
 }
}
for(const id of wanted)assert(counts[id]>0,id+' unreachable');
assert(companions.size>30,'Modules should recombine with different surrounding abilities');
assert.equal(attackTimings.size,3,'All three timings must be reachable');
assert(attackCompanions.size>5,'Triple attack must recombine instead of copying a fixed card');
// Concentrated samples exercise rare interactions without forcing a fixed seed/card.
let state=19317,stormTriples=0,chaosTriples=0;
const random=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/2**32);
for(let i=0;i<4400;i++){
 const chaos=i>=3200,name=randomMatchingName({type:'follower',rarity:3,costBand:'7+'},{random,chaos});
 const c=generate(name,{chaos}),a=c.abilities.find(a=>a.ids.includes('tripleAttack'));
 assert(c.attack+c.health+c.spent<=c.budget+.01,name);
 if(!a)continue;
 assert.deepEqual(c,generate(name,{chaos}));
 assert.equal(a.price,multipleAttackPrice(c.attack,3,a.trigger));
 if(chaos)chaosTriples++;
 if(c.abilities.some(a=>a.ids.includes('疾驰'))){
  stormTriples++;assert(c.cost>=8);assert.equal(a.trigger,'');
  assert(stormCardValue(c.attack,c.health,c.abilities).value<=c.cost*(chaos?1.15:1)+.01);
 }
}
assert(stormTriples>0,'Rare low-attack Storm combinations must be reachable');
assert(chaosTriples>0);
const report={counts,examples,combinations:companions.size,attackTimings:[...attackTimings],attackCombinations:attackCompanions.size,stormTriples,chaosTriples};
require('node:fs').writeFileSync(__dirname+'/multi-attack-validation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));

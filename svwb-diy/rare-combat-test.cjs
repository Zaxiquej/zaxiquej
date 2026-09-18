const assert=require('node:assert/strict'),{generate,keywordPrice}=require('./engine');
const wanted=['abilityDestructionImmune','combatDestroy','tripleAttack','damageCap','reduceDamage'];
const counts=Object.fromEntries(wanted.map(id=>[id,0])),examples={},companions=new Set();
assert(keywordPrice('灵气',6,6,{protected:true})>keywordPrice('灵气',6,6));
assert.equal(keywordPrice('虹吸',6,6,{attacks:3}),keywordPrice('虹吸',6,6)*3);
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
  assert(c.rarity===3&&c.cost>=7);assert(!ids.some(id=>['疾驰','doubleAttack','selfEvolve','selfSuperEvolve'].includes(id)));
  const a=c.abilities.find(a=>a.ids.includes('tripleAttack'));assert.equal(a.trigger,'超进化时');const bonus=a.ids.length>1?c.evolutionFocusBonus:null;assert(Math.abs(a.price-(bonus?.price||0)-(a.raw-(bonus?.raw||0))*.5)<1e-8);
  for(const b of c.abilities.filter(a=>['攻击时','交战时'].includes(a.trigger)&&a.condition==='none'))assert(b.price>=b.raw*(b.trigger==='交战时'?1.6:1.15)*3-1e-8);
 }
}
for(const id of wanted)assert(counts[id]>0,id+' unreachable');
assert(companions.size>30,'Modules should recombine with different surrounding abilities');
console.log(JSON.stringify({counts,examples,combinations:companions.size},null,2));

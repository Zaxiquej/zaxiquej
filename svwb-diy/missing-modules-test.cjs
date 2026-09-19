const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={mixed:0,highest:0,enemy:0,supply:0,stationary:0},examples={},variants={mixed:new Set(),enemy:new Set(),stationary:new Set(),highest:new Set()};
let state=495;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<16000;i++){
 const c=S.generate(S.randomMatchingName({class:[0,2,3,6][i%4]},{random}));
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 const note=(id)=>{counts[id]++;examples[id]??={name:c.name,cost:c.cost,attack:c.attack,health:c.health,text:c.abilities.map(a=>a.text)};};
 for(const a of c.abilities){
  if(a.ids.includes('mixedStats')){
   note('mixed');assert.equal(c.class,0);
   for(const m of a.text.matchAll(/\+(\d+)\/-(\d+)/g)){assert(+m[1]>0&&+m[2]>0);variants.mixed.add(m[0]);}
   if(!['入场曲','进化时','超进化时','法术','爆能强化','启动'].includes(a.trigger))assert(!a.text.includes('选择战场上的'),c.name+' automatic mixed target');
  }
  if(a.ids.includes('amuletReviveHighest')){
   note('highest');assert.equal(c.class,6);assert(a.text.includes('原始费用最大的'));variants.highest.add(a.trigger);
   assert(!(c.type==='amulet'&&a.trigger==='谢幕曲'),c.name+' self resurrection loop');
   assert(['入场曲','进化时','超进化时','法术','爆能强化','启动','谢幕曲'].includes(a.trigger));
  }
  if(a.ids.includes('enemySupply')){
   note('supply');assert(c.enemyEntry&&c.abilities.some(a=>a.ids.includes('enemyEntry')));assert.equal(c.class,2);
   assert(a.text.includes('在对手的战场上召唤'));assert(!a.boardValue,'Enemy supply is not own board development');
   if(a.enemySupply){const v=a.enemySupply;assert.equal(v.unitPrice,Math.max(.6,v.entryRaw-v.opponentBodyCredit));assert(v.count<=2);}
   assert(a.tokens.some(t=>t.id===90021110));
  }
 }
 if(c.enemyEntry){note('enemy');c.enemyEntry.effects.forEach(x=>variants.enemy.add(x));const a=c.abilities.find(a=>a.ids.includes('enemyEntry'));assert.equal(a.price,a.occurrenceRaw*3.2);assert.equal(a.raw,a.price);assert(!/选择/.test(a.text));}
 if(c.stationaryDesign){
  note('stationary');assert([2,3,6].includes(c.class));assert.equal(c.type,'follower');
  const d=c.stationaryDesign;assert(d.credit<=5&&d.credit>0);assert(d.payoffRaw*d.multiplier+d.bodyBonus<=d.credit+d.spare+.001);
  assert(c.abilities.some(a=>a.ids.includes('cannotAttack')&&a.text==='无法攻击随从或主战者。'));
  assert(!c.abilities.some(a=>['攻击时','交战时'].includes(a.trigger)||a.ids.some(x=>['疾驰','突进','威慑','潜行','虹吸','doubleAttack','tripleAttack','handStorm','selfCopy'].includes(x))),c.name+' incompatible stationary design');
  const a=c.abilities.find(a=>['自己的回合开始时','自己的回合结束时'].includes(a.trigger)&&a.price===d.payoffRaw*d.multiplier);assert(a);a.ids.forEach(x=>variants.stationary.add(x));
 }
}
for(const [id,n]of Object.entries(counts))assert(n>0,'Unreachable '+id);
assert(variants.mixed.size>=2);assert(variants.enemy.size>=3);assert(variants.stationary.size>=3);assert(variants.highest.size>=2);
assert(variants.highest.has('谢幕曲'),'History resurrection must actually reach Last Words');
for(const e of Object.values(examples))assert.deepEqual(S.generate(e.name),S.generate(e.name));
const report={version:S.VERSION,seeds:16000,counts,variants:Object.fromEntries(Object.entries(variants).map(([k,v])=>[k,[...v]])),examples};
fs.writeFileSync(__dirname+'/missing-modules-validation.json',JSON.stringify(report,null,2));console.log('PASS',counts,report.variants,examples);

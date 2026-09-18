const assert=require('node:assert/strict'),S=require('./engine');
const seen={neutralSingleton:0,portalSingleton:0,dragonLowHealth:0,nightmareLowHealth:0,alternate:0,emblem:0,amulet:0,spell:0};
for(let i=0;i<60000;i++){
 const c=S.generate('职业条件'+i);
 const pieces=[...c.abilities,...c.emblems,...c.alternateForms.flatMap(f=>f.abilities||[])];
 for(const a of pieces){
  if(a.condition==='singleton'||a.text.includes('牌组中没有重复随从')){assert([0,7].includes(c.class),c.name);seen[c.class===0?'neutralSingleton':'portalSingleton']++;}
  if(a.condition==='lowHealth'||a.conditionId==='lowHealth'||/自己的主战者的生命值为\d+或以下/.test(a.text)){
   assert([4,5].includes(c.class),c.name);seen[c.class===4?'dragonLowHealth':'nightmareLowHealth']++;
   if(c.emblems.includes(a))seen.emblem++;if(c.type!=='follower')seen[c.type]++;
  }
  if(c.alternateForms.some(f=>f.abilities?.includes(a))&&['singleton','lowHealth'].includes(a.condition))seen.alternate++;
 }
}
for(const [k,n]of Object.entries(seen))assert(n>0,k+' must remain reachable');
console.log('PASS: 60,000 seeds; singleton only Neutral/Portal, low health only Dragon/Nightmare, including spells, amulets, emblems and Accelerate.');console.log(seen);

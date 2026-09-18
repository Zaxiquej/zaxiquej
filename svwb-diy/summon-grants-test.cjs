const assert=require('node:assert/strict'),S=require('./engine');
const counts={},examples={},deaths=new Set(),deliveries=new Set();let combined=0;
for(let i=0;i<24000;i++){
 const c=S.generate('召唤赋予回归'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5,c.name+' slots');
 for(const a of c.abilities){
  for(const id of a.ids.filter(id=>/^summon(?:Rush|Ward|Storm|Bane|Drain|Death)/.test(id))){
   counts[id]=(counts[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos};
   assert(a.text.includes('召唤')&&a.text.includes('使这些随从获得'),c.name+' unbound grant');
   if(id.startsWith('summonDeath'))deaths.add(id);
  }
  if(a.summonGrants){
   const g=a.summonGrants;deliveries.add(c.type);assert(g.count>=1);assert.equal(g.extra,g.grants.reduce((s,g)=>s+g.raw,0));
   if(g.grants.length>1)combined++;
   if(g.grants.some(g=>g.id==='summonStorm')){assert(g.effectiveCost>=5);assert(g.count*g.attack*g.attacks<=g.effectiveCost*(c.chaos?1.2:1));assert(g.extra>0);}
   for(const v of g.grants){if(['summonRush','summonWard'].includes(v.id))assert.equal(v.raw,0);if(v.id.startsWith('summonDeath'))assert(v.raw>0);}
  }
  if(a.tribeEffect?.includes('+'))combined++;
  for(const m of a.text.matchAll(/「【谢幕曲】([^」]*)」/g))assert(!/选择|召唤|【模式】/.test(m[1]));
 }
}
for(const id of ['summonRush','summonWard','summonStorm','summonBane','summonDrain','summonDeathDraw','summonDeathHeal','summonDeathDamage','summonDeathGrave'])assert(counts[id]>0,id+' unreachable');
assert.equal(deliveries.size,3);assert(deaths.size>=3&&combined>0);
console.log(JSON.stringify({counts,examples,combined,types:[...deliveries]},null,2));

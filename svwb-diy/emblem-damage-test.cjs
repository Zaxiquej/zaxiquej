const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
let state=489;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
const counts={clock:0,damage:0,largeSingle:0,splitDamage:0,aoe:0,permanentLarge:0},examples={};
for(let i=0;i<6500;i++){
 const c=S.generate(S.randomMatchingName({type:'follower',costBand:'7+',rarity:i%2?2:3},{random}));
 assert(c.attack+c.health+c.spent<=c.budget+.02,c.name+' budget');
 for(const e of c.emblems){
  if(!['start','end'].includes(e.eventId))continue;counts.clock++;
  assert.equal(e.limit,null);assert(!/选择|【模式】/.test(e.text),c.name+' automatic');
  for(const p of e.effects){
   if(!['damage','splitDamage','aoe'].includes(p.id))continue;
   counts[p.id]++;examples[p.id]??={name:c.name,text:e.text};
   assert(p.raw>0);
   if(p.id==='damage'){assert(p.raw>=2*1.25,c.name+' high-cost chip');if(p.raw>=3*1.25)counts.largeSingle++;}
   if(e.duration===null&&(p.id==='aoe'||p.raw>=3*1.25))counts.permanentLarge++;
  }
 }
}
for(const [k,v]of Object.entries(counts))assert(v>0,k+' missing');
fs.writeFileSync(__dirname+'/emblem-damage-validation.json',JSON.stringify({version:S.VERSION,seeds:6500,counts,examples},null,2));console.log('PASS',counts,examples);

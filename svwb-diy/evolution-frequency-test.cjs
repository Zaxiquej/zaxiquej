const assert=require('node:assert/strict'),S=require('./engine');
let followers=0,conditional=0,unconditional=0;const gates=new Set(),examples={};
for(let i=0;i<12000;i++){
 const c=S.generate('进化频率'+i);if(c.type!=='follower')continue;followers++;
 for(const a of c.abilities){
  if(!a.ids.some(id=>['selfEvolve','selfSuperEvolve'].includes(id)))continue;
  assert(!c.abilities.some(b=>['进化时','超进化时'].includes(b.trigger)));
  if(a.condition==='none')assert(c.cost>=5);
  if(a.trigger!=='入场曲')continue;
  if(a.condition==='none'){unconditional++;examples.unconditional??=c.name;}
  else {conditional++;gates.add(a.condition);examples.conditional??=c.name;}
 }
}
assert(unconditional>0&&unconditional<105*.25,'Unconditional Fanfare evolution must be markedly rarer than the v4.23 sample (105)');
assert(conditional>unconditional*3&&gates.size>=5,'Conditional evolution should remain varied and predominate');
console.log('PASS: shared unconditional evolution restriction, conditional coverage, and no invalid EP-trigger companions.');console.log({followers,conditional,unconditional,gates:[...gates],examples});

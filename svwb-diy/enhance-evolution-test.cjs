const assert=require('node:assert/strict'),S=require('./engine');
let enhanced=0,cheapBase=0;
for(let i=0;i<12000;i++){
 const c=S.generate('爆能进化'+i);
 assert(!c.abilities.some(a=>a.text.includes('若本随从为进化前，则本随从')));
 for(const a of c.abilities.filter(a=>a.ids.some(id=>['selfEvolve','selfSuperEvolve'].includes(id)))){
  assert.equal(c.type,'follower');
  assert(!c.abilities.some(x=>['进化时','超进化时'].includes(x.trigger)));
  if(a.trigger==='爆能强化'){
   enhanced++;if(c.cost<4)cheapBase++;
   assert(a.enhanceCost>=4&&a.enhanceCost>c.cost);
   if(a.ids.includes('selfSuperEvolve'))assert(a.enhanceCost>=7&&c.rarity===3);
   assert(a.raw>=a.minPayoff&&a.price>0);
  }
 }
 if(c.type==='follower')assert(c.attack+c.health+c.spent<=c.budget+.02);
}
assert(enhanced>=5&&cheapBase>0);
console.log('PASS: concise self-evolution wording, Enhance-fee eligibility, useful paid payloads, budgets.',{enhanced,cheapBase});

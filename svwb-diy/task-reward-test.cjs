const assert=require('node:assert/strict'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const simple=S.transformationTaskValue('deaths',5,2,3),hard=S.transformationTaskValue('deaths',8,2,3);
assert(hard.minimumGain>simple.minimumGain);assert(hard.factor<simple.factor);assert(hard.effectCost>=simple.effectCost);
assert(simple.minimumGain>4.96,'Reject the reported combat-heal upgrade');
assert(S.transformationTaskValue('evolutions',5,2,3).minimumGain>simple.minimumGain,'Five evolutions and five deaths are different tasks');
let tasks=0,gates=0,frail=0;const styles={};
for(let i=0;i<8000;i++){
 const options={chaos:i%2===0},c=S.generate(i===0?'设计师您辛苦了#966084':'任务收益513-'+i,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities)if(a.trigger==='进化时'&&a.condition==='superUnlocked'){
  gates++;assert(!a.ids.includes('buff'),c.name+' redundant late self-buff');assert(a.raw>=a.minPayoff-1e-8);
 }
 const p=c.progressTransform;if(!p)continue;tasks++;styles[p.style]=(styles[p.style]||0)+1;
 const a=c.abilities.find(a=>a.kind==='progressTransform'),t=c.tokens.find(t=>t.id===p.targetId);
 assert(a.raw>=p.task.minimumGain-1e-8);
 assert(a.raw-p.discountRaw>=p.task.minimumGain*.75-1e-8);
 assert.equal(p.factor,p.task.factor);
 assert(Math.abs(p.price-a.raw*p.factor)<1e-8);
 assert.equal(t.cost,c.cost-p.discount);
 if(p.style==='engine'&&c.health<=2&&!c.abilities.some(a=>a.ids.some(id=>['突进','屏障','damageCap'].includes(id)))){
  frail++;assert.equal(t.abilities.at(-1).trigger,'自己的回合结束时');
 }
 assert.deepEqual(c,S.generate(c.name,options));
}
assert(tasks>20);assert(gates>0);assert(Object.keys(styles).length>=3);
console.log({version:S.VERSION,samples:8000,tasks,gates,frail,styles});

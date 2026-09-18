const assert=require('node:assert/strict'),S=require('./engine');
let count=0,delayed=0;const fees=new Set(),waits=new Set(),examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('结晶估值'+i);
 for(const f of c.alternateForms.filter(f=>f.kind==='结晶')){
  count++;fees.add(f.cost);waits.add(f.countdown);examples.basic??=c.name;
  assert.equal(f.text,`【吟唱 ${f.countdown}】\n【谢幕曲】召唤1个『${c.name}』。`);
  assert(f.cost<c.cost&&f.countdown>=2);
  assert(f.valuation.summonValue>0);
  assert(f.valuation.summonValue<=f.cost*2.8+f.countdown*3.5+.001,'Delayed summon must fit the form allowance');
  if(f.valuation.delayAdded){delayed++;examples.delayed??=c.name;assert(f.countdown>f.valuation.baseCountdown);}
  assert.deepEqual(c,S.generate(c.name));
 }
}
assert(count>100&&delayed>5&&delayed<count);
assert.equal(fees.size,3);assert(waits.size>=4);
console.log('PASS: crystallize has no free cantrip; final summon value, delayed powerful bodies, fee/delay variety, deterministic forms.');
console.log({count,delayed,fees:[...fees],waits:[...waits],examples});

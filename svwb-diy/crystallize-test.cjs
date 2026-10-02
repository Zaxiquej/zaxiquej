const assert=require('node:assert/strict'),S=require('./engine');
let count=0,delayed=0;const routes={incubate:0,amulet:0},triggers=new Set(),fees=new Set(),waits=new Set(),examples={};
for(let i=0;i<20000;i++){
 const name='结晶估值'+i,h=S.header(name);if(h.type!=='follower'||h.cost<5)continue;
 const c=S.generate(name);
 for(const f of c.alternateForms.filter(f=>f.kind==='结晶')){
  count++;fees.add(f.cost);routes[f.route]++;assert(f.cost<c.cost);
  if(f.route==='amulet'){
   assert(f.abilities.length>0);assert(f.spent<=f.budget+.011);
   assert.equal(f.text,f.abilities.map(a=>a.text).join('\n\n'));
   assert(!f.abilities.some(a=>a.kind==='alternate'));
   for(const a of f.abilities){triggers.add(a.trigger);if(a.trigger)examples[a.trigger]??=c.name;}
   if(f.abilities.some(a=>a.trigger==='谢幕曲'))assert(f.countdown>0||f.abilities.some(a=>a.activation?.breaksSelf));
   if(f.abilities.some(a=>a.ids.includes('earthSigil')))assert(f.abilities.some(a=>a.activation?.earthAmount>0&&!a.activation.breaksSelf));
   assert.deepEqual(c,S.generate(c.name));continue;
  }
  waits.add(f.countdown);examples.basic??=c.name;
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
assert(routes.incubate>30&&routes.amulet>30);
for(const t of ['启动','入场曲','谢幕曲'])assert(triggers.has(t),t);
assert(['持续触发','自己的回合开始时','自己的回合结束时'].some(t=>triggers.has(t)));
console.log('PASS: independently priced crystallize amulets and delayed summons; activation, fanfare, lasting effects, Last Words, deterministic forms.');
console.log({count,delayed,routes,triggers:[...triggers],fees:[...fees],waits:[...waits],examples});

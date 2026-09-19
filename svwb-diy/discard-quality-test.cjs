const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const repro=S.generate('随机卡牌#94817342');
assert.deepEqual([repro.cost,repro.attack,repro.health],[5,7,7]);
assert.equal(repro.abilities.length,1);assert(repro.abilities[0].text.includes('造成4点伤害'));
const counts={scaled:0,bodyReserve:0,rushBody:0,plainBody:0},payoffs=new Set(),examples={repro:{name:repro.name,chaos:false}};
for(let i=0;i<14000;i++){
 const c=S.generate('弃牌质量'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 const ids=c.abilities.flatMap(a=>a.ids);require('./assert-node-effects.cjs')(c);
 for(const a of c.abilities.filter(a=>a.discardScaling)){
  counts.scaled++;assert.equal(c.class,4);assert(c.cost>=4);assert.equal(a.trigger,'本卡牌被舍弃时');
  assert(!/选择|【模式】/.test(a.text));assert(a.raw>a.discardScaling.before);assert(a.raw<=a.discardScaling.ceiling+1e-8);assert(a.raw<=7);
  assert(Math.abs(a.price-a.raw*1.25)<1e-8);assert(a.raw>=(c.cost>=7?3.75:2.5));
  a.ids.filter(id=>id!=='discardTrigger').forEach(id=>payoffs.add(id));
  for(const t of a.tokens)assert(c.tokens.some(v=>v.id===t.id));
  examples.scaled??={name:c.name,chaos:!!c.chaos};
 }
 if(c.discardBodyReserve){
  counts.bodyReserve++;const b=c.discardBodyReserve;
  assert(c.cost>=4&&c.type==='follower');assert(b.bonus>0);assert.equal(c.attack+c.health,b.before+b.bonus);assert(c.attack+c.health<=b.target);
  assert(c.abilities.every(a=>a.trigger==='本卡牌被舍弃时'||a.kind==='keyword'&&a.ids.every(id=>['突进','守护'].includes(id))));
  assert(!ids.includes('discardSelfSummon'),'A free self summon must not gain the paid-play body allowance');
  const key=ids.includes('突进')?'rushBody':'plainBody';counts[key]++;examples[key]??={name:c.name,chaos:!!c.chaos};
 }
 if(c.discardBodyReserve||c.abilities.some(a=>a.discardScaling))assert.deepEqual(c,S.generate(c.name,{chaos:i%3===0}));
}
for(const [key,n]of Object.entries(counts))assert(n>0,key+' unreachable');assert(payoffs.size>=3);
const report={version:S.VERSION,samples:14000,counts,payoffs:[...payoffs],examples};
fs.writeFileSync(__dirname+'/discard-quality-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

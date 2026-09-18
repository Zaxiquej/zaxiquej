const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={invocation:0,invocationPayoff:0,evolutionHistory:0,combat:0,restoreEP:0,restoreSEP:0},examples={},payoffs=new Set(),histories=new Set();
for(let i=0;i<20000;i++){
 const c=S.generate('历史机制'+i);
 assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities){
  if(a.kind==='invocation'){
   counts.invocation++;examples.invocation??=c.name;
   assert(c.type==='follower'&&c.cost>=6&&c.rarity>=2);
   assert(a.price>=4&&a.text.startsWith('在牌组中发动。')&&a.text.includes('【瞬念召唤】本卡牌'));
   assert(!/选择|【模式】/.test(a.text));
   assert(a.valuation.threshold>=6);histories.add(a.valuation.history);
   const excluded=['入场曲','爆能强化','进化时','超进化时','魔力增幅时','在手牌中发动','在牌组中发动'];
   const delivered=(c.attack+c.health)*.8+c.abilities.filter(x=>x.kind!=='alternate'&&!excluded.includes(x.trigger)).reduce((s,x)=>s+Math.max(x.raw,x.price),0);
   assert.equal(a.valuation.delivered,delivered);
   if(a.valuation.history==='evolutions')assert.equal(a.valuation.threshold,6+Math.max(0,Math.ceil((delivered-16)/8)));
  }
  if(a.trigger==='本卡牌被【瞬念召唤】时'){
   counts.invocationPayoff++;examples.invocationPayoff??=c.name;
   assert(c.abilities.some(x=>x.kind==='invocation'));
   assert(!/选择|【模式】/.test(a.text));
  }
  if(a.condition==='evolutionHistory'){
   counts.evolutionHistory++;examples.evolutionHistory??=c.name;
   assert(c.rarity>=1&&/进化次数为[357]次或以上/.test(a.text));a.ids.forEach(id=>payoffs.add(id));
  }
  if(a.trigger==='交战时'){
   counts.combat++;examples.combat??=c.name;
   assert(c.type==='follower'&&a.condition!=='combo'&&!/选择|【模式】/.test(a.text));
  }
  for(const id of ['restoreEP','restoreSEP'])if(a.ids.includes(id)){
   counts[id]++;examples[id]??=c.name;
   assert(['入场曲','法术','爆能强化'].includes(a.trigger));
   if(id==='restoreSEP')assert(c.rarity>=2);
  }
 }
 if(c.abilities.some(a=>a.kind==='invocation'))assert.deepEqual(c,S.generate(c.name));
}
for(const [key,count]of Object.entries(counts))assert(count>0,key+' absent');
assert(histories.size===2&&payoffs.size>=8);
fs.writeFileSync(__dirname+'/history-validation.json',JSON.stringify({version:S.VERSION,seeds:20000,counts,examples,evolutionPayoffs:[...payoffs],histories:[...histories]},null,2));
console.log('PASS',counts,examples,'evolution payoff variety',payoffs.size);

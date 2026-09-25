const assert=require('node:assert/strict'),S=require('./engine');
const check=require('./assert-node-effects.cjs');
const mystery=S.SUPPORT_CARDS.find(t=>t.id===90011310);
assert.equal(mystery.cost,0);
assert.equal(mystery.text,'回复自己的主战者1点生命值。');
assert(S.tokenValue(mystery,'hand')>S.tokenValue(S.TOKENS.find(t=>t.name==='妖精'),'hand')*3);
assert.equal(S.tokenHandOffer(mystery,0).unitPrice,S.tokenValue(mystery,'hand'));
const counts={oneCost:0,mystery:0,gatedOrDelayed:0};
for(const chaos of [false,true]){
 const c=S.generate('设计师您辛苦了',{chaos});
 assert(!c.abilities.some(a=>a.trigger==='入场曲'&&a.condition==='none'&&a.text.includes('森林的奥秘')));
}
for(let i=0;i<6000;i++){
 const options={chaos:i%2===0},c=S.generate('免费连击509-'+i,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 if(c.type==='follower'&&c.cost<=1)counts.oneCost++;
 for(const a of c.abilities){
  if(!a.text.includes('森林的奥秘'))continue;
  counts.mystery++;
  if(a.condition!=='none'||['谢幕曲','进化时','超进化时'].includes(a.trigger))counts.gatedOrDelayed++;
  assert(!(c.type==='follower'&&c.cost<=1&&a.trigger==='入场曲'&&a.condition==='none'),c.name+' '+a.text);
  if(a.tokenDelivery?.tokenId===mystery.id){
   const d=a.tokenDelivery;
   assert(d.unitPrice>=3.6);
   assert(a.raw>=d.count*d.unitPrice-1e-8);
  }
 }
 if(i<50)assert.deepEqual(c,S.generate(c.name,options));
}
for(const [key,n] of Object.entries(counts))assert(n>0,'Missing coverage: '+key);
console.log({version:S.VERSION,samples:6000,counts});

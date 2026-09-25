const assert=require('node:assert/strict'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const names=['骑士','骸骨士兵'];
for(const name of names){
 const t=S.TOKENS.find(t=>t.name===name);
 assert.deepEqual([t.cost,t.attack,t.health],[0,1,1]);
 assert(S.tokenValue(t,'hand')>S.tokenValue(t));
 assert.equal(S.tokenHandOffer(t,1).unitPrice,S.tokenValue(t,'hand'));
}
assert.equal(S.tokenValue(S.TOKENS.find(t=>t.name==='悬丝傀儡'),'hand'),1.4);
const sample=S.generate('设计师您辛苦了#492319');
assert.deepEqual([sample.class,sample.cost,sample.rarity],[2,1,0]);
assert.equal(sample.attack,0);assert.equal(sample.health,1);
let free=0,cheap=0;
for(let i=0;i<6000;i++){
 const opts={chaos:i%2===0},c=S.generate('零费随从511-'+i,opts);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities){
  if(!/将\d+张『(?:骑士|骸骨士兵)』加入手牌/.test(a.text))continue;
  free++;
  if(c.type==='follower'&&c.cost===1&&a.condition==='none'&&['入场曲','谢幕曲'].includes(a.trigger)){
   cheap++;
   assert(c.attack+c.health<=1,c.name+' free extra body: '+a.text);
  }
  if(a.tokenDelivery&&names.some(name=>S.TOKENS.find(t=>t.name===name).id===a.tokenDelivery.tokenId)){
   assert(a.tokenDelivery.unitPrice>=2.2);
  }
 }
 if(i<30)assert.deepEqual(c,S.generate(c.name,opts));
}
assert(free>0);assert(cheap>0);console.log({version:S.VERSION,samples:6000,free,cheap});

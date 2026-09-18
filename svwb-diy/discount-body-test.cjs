const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const example=S.generate('随机卡牌#01863457');
assert.deepEqual([example.cost,example.attack,example.health],[2,1,1]);
assert.equal(example.handTrigger.expectedDiscount,2);assert.equal(example.discountBodyTrade.lost,2);
const counts={discount:0,paidBody:0,rebalanced:0,remainingExtreme:0,attackEnabledExtreme:0,delayed:0};
for(let i=0;i<12000;i++){
 const c=S.generate('减费与身材'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 if(c.type!=='follower')continue;
 assert(c.attack>=0&&c.health>=1);
 const aggressive=c.abilities.some(a=>['攻击时','交战时'].includes(a.trigger)||a.ids.some(id=>['疾驰','突进','威慑','虹吸','handStorm','doubleAttack','tripleAttack','ignoreWard','selfEvolve','selfSuperEvolve'].includes(id)));
 if(c.discountBodyTrade){
  counts.discount++;const d=c.discountBodyTrade;
  assert(d.lost>=0&&d.lost<=d.targetLoss);if(d.lost)counts.paidBody++;
  if(c.handTrigger?.payoff==='discount'&&c.handTrigger.eventId==='ownSuper')counts.delayed++;
 }
 if(c.bodyBalance){counts.rebalanced++;assert(!aggressive);const b=c.bodyBalance;assert.equal(b.before[0]+b.before[1],b.after[0]+b.after[1]);assert(b.after[0]<b.before[0]);}
 if(c.attack>=c.health*1.6&&c.attack-c.health>=2)counts[aggressive?'attackEnabledExtreme':'remainingExtreme']++;
 if(c.handTrigger?.eventId==='play'&&c.handTrigger.payoff==='discount')assert.equal(c.handTrigger.expectedDiscount,Math.min(c.cost,3));
 if(c.cost>=5&&c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('疾驰')))assert(S.stormCardValue(c.attack,c.health,c.abilities).value<=c.cost*(c.chaos?1.15:1)+.01);
 if(i<100)assert.deepEqual(c,S.generate(c.name,{chaos:i%3===0}));
}
assert(counts.paidBody>30&&counts.rebalanced>100&&counts.attackEnabledExtreme>30&&counts.delayed>0);
assert(counts.remainingExtreme/(counts.rebalanced+counts.remainingExtreme)<.3);
const report={version:S.VERSION,samples:12000,counts};fs.writeFileSync(__dirname+'/discount-body-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

const assert=require('node:assert/strict'),S=require('./engine');
const counts={},examples={},discardPayoffs=new Set();
const record=(id,c)=>{counts[id]=(counts[id]||0)+1;examples[id]??=c.name;};
const expensive=S.generate('手牌代价12898');assert(expensive.spent<=expensive.budget+.01);assert(expensive.abilities.some(a=>a.ids.includes('spellboostDiscount')));
for(let i=0;i<18000;i++){
 const c=S.generate('手牌代价'+i,{chaos:i%2===1});
 assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5,c.name+' slots');
 if(c.handCostTrade){const t=c.handCostTrade;record(t.kind,c);assert.equal(c.type,'follower');assert(c.cost>=3);assert(t.bodyBonus>=1&&t.bodyBonus<=3);const a=c.abilities.find(a=>a.ids.includes(t.kind));assert(a&&a.raw===0&&a.price===0);assert(!/抽取|若以此/.test(a.text));if(t.kind==='discardCost')assert.equal(c.class,4);}
 for(const a of c.abilities){
  if(a.ids.includes('discardTrigger')){record('discardTrigger',c);assert.equal(c.class,4);assert.equal(a.trigger,'本卡牌被舍弃时');assert(!/选择(?:自己|对手)的|【模式】|本随从\+/.test(a.text));a.ids.filter(id=>id!=='discardTrigger').forEach(id=>discardPayoffs.add(id));
   if(a.ids.includes('discardReturn')){record('discardReturn',c);assert.equal(c.type,'spell');assert(a.text.includes(`若本卡牌的费用为${c.cost}`));assert(a.text.includes(`费用变为${c.cost-2}`));}
   else if(!a.ids.includes('discardSelfSummon'))assert(a.raw<=3.5);assert(!a.discardScaling);
  }
  if(['portalHighCost','havenHighCost'].includes(a.condition)){record(a.condition,c);const portal=a.condition==='portalHighCost';assert.equal(c.class,portal?7:6);assert(a.text.includes(`原始费用为${portal?5:6}或以上的${portal?'随从':'卡牌'}`));}
  if(a.trigger.includes('原始费用为5或以上')){record('portalEvent',c);assert.equal(c.class,7);}
  if(a.trigger.includes('原始费用为6或以上')){record('havenEvent',c);assert.equal(c.class,6);}
 }
 for(const f of c.alternateForms)assert(!f.abilities?.some(a=>a.ids.includes('discardTrigger')));
}
for(const id of ['discardCost','shuffleCost','discardTrigger','discardReturn','portalHighCost','havenHighCost','portalEvent','havenEvent'])assert(counts[id]>0,id+' unreachable');
assert(discardPayoffs.size>=4);
console.log(JSON.stringify({counts,examples,discardPayoffs:[...discardPayoffs]},null,2));

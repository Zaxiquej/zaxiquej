const assert=require('node:assert/strict'),S=require('./engine');
const events={},payoffs={},examples={},types=new Set(),allowed={leave:1,combo:1,play:1,enhance:2,earth:3,crystalHands:3,hurt:4,lowHealth:5,activate:6,amuletDeath:6,highCostEnter:7,fusion:7,opponentSuper:0};
for(let i=0;i<20000;i++){
 const c=S.generate('手牌事件回归'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5,c.name+' slots');
 const hand=c.abilities.filter(a=>a.kind==='handTrigger');
 for(const a of hand){
  const h=a.handSpec;events[h.eventId]=(events[h.eventId]||0)+1;payoffs[h.payoff]=(payoffs[h.payoff]||0)+1;
  examples[h.eventId]??={name:c.name,chaos:!!c.chaos};types.add(c.type);
  assert.equal(a.trigger,'在手牌中发动');assert(a.text.startsWith('在手牌中发动。'));assert(!a.text.includes('选择'));
  if(h.eventId!=='ownSuper')assert.equal(c.class,allowed[h.eventId]);
  if(h.payoff!=='discount')assert.equal(c.type,'follower');
  if(h.payoff==='growth'&&!['lowHealth','combo'].includes(h.eventId))assert(h.oncePerTurn);
  if(h.temporary&&h.payoff==='discount')assert(a.text.includes('回合结束前'));
  if(h.keyword==='疾驰'){
   assert(c.cost<=5&&c.attack<=3);assert(c.handStormTrade);
   assert(!c.abilities.some(a=>a.ids.some(id=>['疾驰','doubleAttack','tripleAttack'].includes(id))));
  }
  if(h.payoff==='discount')assert(!c.abilities.some(a=>a.ids.includes('costReduction')||a.ids.includes('spellboostDiscount')||a.ids.includes('crystalHandCostReduction')));
 }
 assert(hand.length<=1);
 for(const form of c.alternateForms)assert(!form.text.includes('在手牌中发动'));
}
for(const id of Object.keys(allowed))assert(events[id]>0,id+' unreachable');
assert(events.ownSuper>0);assert(payoffs.discount>0&&payoffs.growth>0&&payoffs.keyword>0);assert.equal(types.size,3);
console.log(JSON.stringify({events,payoffs,examples,types:[...types]},null,2));

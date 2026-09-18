const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
assert(S.keywordPrice('疾驰',1,2)<1);
assert(S.keywordPrice('疾驰',2,2)<1.2);
assert(S.keywordPrice('疾驰',7,5)-S.keywordPrice('疾驰',6,5)>S.keywordPrice('疾驰',2,2)-S.keywordPrice('疾驰',1,2));
assert.equal(S.stormCardValue(7,5,[]).value,8);
assert(S.stormCardValue(7,5,[{ids:['face','draw'],trigger:'入场曲',condition:'none',price:12.5,text:'对对手的主战者造成3点伤害。抽取2张卡牌。'}]).value>8);
const keys=['silence','setHealth','leaderVulnerability','clearEmblems','clearAmulets','emblemExtend','ignoreWard','exhaustibleCycle','handTransform','truthTransform'];
const counts={},examples={},cycles=new Set();
for(let i=0;i<40000;i++){
 const c=S.generate('金虹复查'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5,c.name+' slots');
 if(c.alternateForms.length)assert(c.abilities.some(a=>a.kind==='alternate'));
 const storm=c.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('疾驰'));
 if(storm){assert.equal(storm.price,S.keywordPrice('疾驰',c.attack,c.health));if(c.attack===1)assert.equal(c.stormBodyTrade?.targetLoss,0);}
 for(const a of c.abilities){
  assert(!/\$(?:OWNCREST|CORE|TOKEN)/.test(a.text));
  for(const id of keys.filter(id=>a.ids.includes(id))){counts[id]=(counts[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos};}
  if(a.ids.includes('leaderVulnerability'))assert(c.class===7&&c.rarity>=2);
  if(a.ids.includes('clearEmblems'))assert(c.class===0&&c.rarity>=2&&!a.text.includes('信仰'));
  if(a.ids.includes('ignoreWard'))assert(c.class===4&&c.cost>=7);
  if(a.ids.includes('handTransform'))assert(c.class===1&&c.tokens.some(t=>t.id===90014310));
  if(a.ids.includes('truthTransform'))assert(c.class===3&&c.tokens.some(t=>t.id===90034310));
  if(a.ids.includes('emblemExtend'))assert(c.emblems.some(e=>e.duration!=null&&e.owner!=='opponent'&&e.eventId!=='lastWords'&&a.text.includes(e.name)));
  if(a.cycle){
   if(c.type==='amulet')assert.equal(c.countdown,null,'Three-turn cycle must not expire before delivering its branches');
   assert(a.cycle.withoutReplacement&&!a.cycle.reset);assert.equal(a.cycle.branches.length,3);
   assert(new Set(a.cycle.branches.map(b=>b.ids[0])).size===3);cycles.add(a.cycle.branches.map(b=>b.ids.join(',')).join('|'));
   assert(!/选择(?:自己|对手)的|【模式】/.test(a.text));
  }
  if(!['入场曲','法术','进化时','超进化时','爆能强化','启动'].includes(a.trigger))assert(!/选择(?:自己|对手)的/.test(a.text),c.name+' automatic selection');
 }
 assert(!c.replacementDeck);
}
for(const k of keys)assert(counts[k]>0,k+' unreachable');assert(cycles.size>3);
const report={version:S.VERSION,samples:40000,counts,examples,cycleVariants:cycles.size};
fs.writeFileSync(__dirname+'/high-rarity-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

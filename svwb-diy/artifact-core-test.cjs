const assert=require('node:assert/strict'),S=require('./engine'),R=require('./reference.json');
const registry=[...S.TOKENS,...S.SUPPORT_CARDS,...S.RELATED_CARDS];
for(const id of [90071210,90071220,90072110,90072120,90073110,90074110]){
 const t=registry.find(t=>t.id===id),o=R.cards.find(c=>c.id===id);
 for(const k of ['name','cost','attack','health','text','class'])assert.equal(t[k],o[k]);
 assert.equal(t.tribeId,14);
}
const counts={},examples={},deliveries=new Set();
for(let i=0;i<20000;i++){
 const c=S.generate('核心创造物回归'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities){
  assert(!/\$(?:CORE|FUSIONARTIFACT)/.test(a.text));
  assert(!/召唤[^。]*『(?:过往|未来)核心』/.test(a.text));
  for(const id of a.ids.filter(id=>['coreSupply','corePair','fusionArtifactHand','fusionArtifactSummon'].includes(id))){
   counts[id]=(counts[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos};assert.equal(c.class,7);
  }
  for(const name of ['城堡创造物','攻击创造物']){
   if(a.text.includes(`张『${name}』加入手牌`))deliveries.add(name+' hand');
   if(a.text.includes(`个『${name}』`))deliveries.add(name+' summon');
  }
  if(a.trigger.includes('进入战场时'))assert(!a.ids.includes('fusionArtifactSummon'));
 }
 for(const t of c.tokens){
  if([90071210,90071220,90072110,90072120].includes(t.id))assert.equal(c.class,7);
  for(const m of t.text.matchAll(/『([^』]+)』/g)){
   const referenced=registry.find(t=>t.name===m[1]);
   if(referenced)assert(c.tokens.some(t=>t.id===referenced.id),c.name+' missing '+m[1]);
  }
  if(t.id===90074110)assert(t.related,'Omega must not enter the direct reward pool');
 }
}
for(const id of ['coreSupply','corePair','fusionArtifactHand','fusionArtifactSummon'])assert(counts[id]>0,id+' unreachable');
assert.equal(deliveries.size,4);
console.log(JSON.stringify({counts,examples,deliveries:[...deliveries]},null,2));

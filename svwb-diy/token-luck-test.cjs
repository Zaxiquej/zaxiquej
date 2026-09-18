const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const counts={},examples={},patterns=new Set(),rewards=new Set(),special=new Set([90041120,90061110,90061130]);
function hit(id,c){counts[id]=(counts[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos};}
for(const t of S.TOKENS){const o=R.cards.find(c=>c.id===t.id);for(const k of ['name','cost','attack','health','text','class'])assert.equal(t[k],o[k]);}
for(let i=0;i<40000;i++){
 const c=S.generate('花签与变身'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');assert(c.abilities.length<=5,c.name+' slots');
 for(const a of c.abilities){
  assert(!/\$(?:TOKEN|TRANSFORM|SELF)/.test(a.text));
  const active=['入场曲','进化时','超进化时','法术','爆能强化','启动'].includes(a.trigger);
  if(!active)assert(!/选择(?:(?:自己|对手)的|战场上的)/.test(a.text),c.name+' automatic choice');
  if(/『炽炎幼龙』/.test(a.text))hit('babyDragon',c);
  if(/『圣炎猛虎』/.test(a.text))hit('tiger',c);
  for(const id of ['transformAlly','transformEnemy','transformEither','handLuck','drawLuckEmblem'])if(a.ids.includes(id))hit(id,c);
  for(const t of c.tokens.filter(t=>special.has(t.id))){
   const hand=new RegExp(`将[0-9X]+张『${t.name}』加入手牌`).test(a.text);
   if(hand){hit('discountedHand'+t.id,c);assert(new RegExp(`将[0-9X]+张『${t.name}』加入手牌，使这些卡牌的费用-[12]。`).test(a.text));}
   if(a.text.includes(`个『${t.name}』`)&&a.text.includes('召唤'))hit('summon'+t.id,c);
  }
  if(a.tokenDelivery?.discount){const d=a.tokenDelivery,t=S.TOKENS.find(t=>t.id===d.tokenId);assert(d.unitPrice>S.tokenValue(t,'hand'));assert(t.cost-d.discount>=2);assert(a.raw+1e-8>=d.unitPrice*d.count);}
  if(a.ids.some(id=>['transformAlly','transformEnemy','transformEither'].includes(id))){assert([1,3].includes(c.class));assert(a.tokens.length);if(a.ids.includes('transformEither'))assert.equal(c.class,3);}
  if(a.luck?.kind==='handCostPattern'){
   assert.equal(c.class,5);assert(c.cost>=6&&c.rarity>=2);
   assert(a.luck.rounds<=2&&a.luck.threshold>=3);assert(a.text.includes('之后，若自己的手牌中'));
   assert(a.price+1e-8>=a.luck.rounds*1.4*.25);patterns.add(a.luck.pattern+':'+a.luck.threshold+':'+a.luck.rounds);rewards.add(a.ids.at(-1));
  }
 }
 for(const e of c.emblems.filter(e=>e.luck?.kind==='drawCost')){
  assert.equal(c.class,6);assert(e.luck.drawOnly);assert.equal(new Set([...e.luck.hitCosts,...e.luck.missCosts]).size,6);
  const immediate=e.text.replace(/获得「【谢幕曲】[^」]+」/g,'');
  assert(!/抽取|加入手牌|\bX\b/.test(immediate),'Immediate draw payoff must not recursively draw or reference undefined X');
  assert(e.text.includes('若为自己的回合'));assert(c.abilities.some(a=>a.emblemIds?.includes(e.id)));
  patterns.add(e.luck.hitCosts.join(','));rewards.add(e.effects[0].id);
 }
}
for(const key of ['babyDragon','tiger','transformAlly','transformEnemy','transformEither','handLuck','drawLuckEmblem',...Array.from(special,id=>'discountedHand'+id)])assert(counts[key]>0,key+' unreachable');
for(const id of special)assert(counts['summon'+id]>counts['discountedHand'+id]*2,'Summon should dominate delivery');
assert(patterns.size>12&&rewards.size>3,'Predicates and payoffs must recombine');
const report={version:S.VERSION,samples:40000,counts,examples,patterns:patterns.size,rewards:[...rewards]};
fs.writeFileSync(__dirname+'/token-luck-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));

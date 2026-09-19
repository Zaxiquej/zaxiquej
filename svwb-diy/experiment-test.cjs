const assert=require('node:assert/strict'),S=require('./engine'),R=require('./reference.json');
const official=R.cards.find(c=>c.id===10931110),token=S.TOKENS.find(t=>t.id===official.id);
for(const key of ['name','class','cost','attack','health','text'])assert.equal(token[key],official[key]);
assert(!token.tribe);assert(token.text.includes('其他『沉溺的实验体』的张数为5张或以上'));
assert(S.tokenValue(token)>S.tokenValue(S.TOKENS.find(t=>t.id===90041130)));
const counts={},examples={},variants=new Set(),types=new Set();
const hit=(id,c)=>{counts[id]=(counts[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos};};
for(let i=0;i<30000;i++){
 const c=S.generate('实验体回归'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5,c.name+' slots');
 for(const a of c.abilities){
  assert(!/\$EXPERIMENT/.test(a.text));
  for(const id of a.ids.filter(id=>id.startsWith('experiment'))){hit(id,c);assert.equal(c.class,3);}
  if(a.condition==='experimentHistory'){hit('experimentHistory',c);assert.equal(c.class,3);}
  if(a.ids.some(id=>id.startsWith('experiment'))){
   assert(c.tokens.some(t=>t.id===official.id),c.name+' missing definition');types.add(c.type);
   if(!['入场曲','法术','进化时','超进化时','爆能强化','启动'].includes(a.trigger))assert(!a.text.includes('选择自己的'));
  }
  if(a.ids.includes('experimentFusion')){
   assert.equal(c.fusion.mode,'event');assert([0,1,2].includes(c.fusion.ppCost));assert(c.fusion.oncePerTurn);
   assert.equal(c.abilities.filter(a=>a.kind==='fusion').length,1);
   assert.equal(c.type,'follower');assert(['卡牌','法术'].includes(c.fusion.material));
   assert(c.abilities.some(a=>a.fusionPartner&&a.ids.some(id=>id.startsWith('experiment'))));
  }
  if(a.trigger.includes('进入战场时'))assert(!a.ids.includes('experimentSummon'));
  if(c.cost===1&&a.trigger==='入场曲'&&a.condition==='none')assert(!a.ids.includes('experimentSummon'));
 }
 for(const e of c.emblems.filter(e=>e.eventId==='experiment')){
  hit('experimentEmblem',c);assert.equal(c.class,3);
  assert(!e.effects.some(e=>e.id==='summon'));
  e.effects.forEach(e=>variants.add(e.id));
  assert(!e.text.includes('选择'));
 }
 if(c.tokens.some(t=>t.id===official.id))assert.equal(c.class,3);
}
for(const id of ['experimentSupply','experimentSummon','experimentBuff','experimentGrant','experimentFusion','experimentHistory','experimentEmblem'])assert(counts[id]>0,id+' unreachable');
assert(variants.size>=3);assert.equal(types.size,3);
console.log(JSON.stringify({counts,examples,emblemPayoffs:[...variants],types:[...types]},null,2));

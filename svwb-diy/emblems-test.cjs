const assert=require('node:assert/strict');
const {generate}=require('./engine.js');
const groups=Array.from({length:8},()=>({n:0,texts:new Set(),events:new Set(),conditions:new Set(),pairs:new Map()}));
let compound=0,permanent=0,lastWords=0,deathGrant=0;const deathEffects=new Set(),limits={unlimited:0,one:0,two:0};
for(let i=0;i<30000;i++){
 const c=generate('纹章重组'+i);if(c.type!=='follower')continue;
 for(const e of c.emblems){
  const g=groups[c.class];g.n++;g.texts.add(e.text);g.events.add(e.eventId);g.conditions.add(e.conditionId);
  const skeleton=e.eventId+'|'+e.conditionId+'|'+e.effects.map(p=>p.id).join('+');
  g.pairs.set(skeleton,(g.pairs.get(skeleton)||0)+1);
  assert(e.effects.length>=1&&e.effects.length<=2);
  if(e.effects.length===2)compound++;
  if(e.duration===null){permanent++;assert(!/^【吟唱 \d+】/.test(e.text));}
  if(e.eventId==='lastWords'){
   lastWords++;assert(Number.isInteger(e.duration)&&e.duration>=2);assert.equal(e.limit,null);
   assert(e.text.includes('【谢幕曲】'));assert(!/选择|【模式】|每回合最多/.test(e.text));
   e.effects.forEach(p=>deathEffects.add(p.id));
   if(c.abilities.some(a=>a.trigger==='谢幕曲'&&a.emblemIds?.includes(e.id)))deathGrant++;
  }
  if(['start','end','lastWords'].includes(e.eventId))assert.equal(e.limit,null);
  else {assert([null,1,2].includes(e.limit));limits[e.limit===null?'unlimited':e.limit===1?'one':'two']++;if(e.limit!==null)assert(e.text.includes(`每回合最多发动${e.limit}次`));else assert(!e.text.includes('每回合最多发动'));}
  if(e.eventId==='heal')assert(!e.effects.some(p=>p.produces.includes('heal')));
  if(['artifact','crystalHands'].includes(e.eventId))assert(!e.effects.some(p=>p.produces.includes('enter')));
  assert(!e.text.includes('否则，回复自己的主战者'),'Old fixed bifurcating recipe survived');
  const grant=c.abilities.find(a=>a.emblemIds?.includes(e.id));assert(grant);
  for(const token of grant.tokens)assert(c.tokens.some(t=>t.id===token.id));
 }
}
for(const g of groups){
 assert(g.n>100&&g.texts.size>50&&g.pairs.size>30,'Each class must recompose emblems');
 assert(g.events.size>=3&&g.conditions.size>=3);
 assert(Math.max(...g.pairs.values())/g.n<.2,'A single recipe dominates');
}
assert(compound>50&&permanent>300);
assert(lastWords>50&&deathGrant>5&&deathEffects.size>=7,'Crest Last Words must recompose and support a death-time grant');
assert(limits.unlimited>50&&limits.two>50&&limits.one>50);
assert(limits.one/(limits.unlimited+limits.one+limits.two)<.65);
console.log('PASS: 30,000 seeds; emblem recombination, variety within every class, trigger quotas, loop guards, token references.');
console.log({compound,permanent,lastWords,deathGrant,deathEffects:[...deathEffects],classes:groups.map(g=>({cards:g.n,texts:g.texts.size,structures:g.pairs.size,events:g.events.size,conditions:g.conditions.size}))});

const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={ordinary:0,low:0,mid:0,high:0,heal:0,damage:0,draw:0,bodyReserve:0,rushBody:0,plainBody:0},payoffs=new Set(),examples={};
for(let i=0;i<14000;i++){
 const chaos=i%3===0,c=S.generate('弃牌质量'+i,{chaos});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 const ids=c.abilities.flatMap(a=>a.ids);require('./assert-node-effects.cjs')(c);
 for(const a of c.abilities.filter(a=>a.trigger==='本卡牌被舍弃时')){
  assert(!a.discardScaling,'Discard rewards must never scale with printed PP');
  if(a.ids.some(id=>['discardSelfSummon','discardReturn'].includes(id)))continue;
  counts.ordinary++;counts[c.cost<=3?'low':c.cost<=6?'mid':'high']++;
  assert.equal(c.class,4);assert(!/选择|【模式】/.test(a.text));
  assert(a.raw<=3.5+1e-8,c.name+' raw cap');assert(Math.abs(a.price-a.raw*1.25)<1e-8);
  for(const match of a.text.matchAll(/回复自己的主战者(\d+)点生命值/g)){counts.heal++;assert(+match[1]<=2,c.name+' healing');}
  for(const match of a.text.matchAll(/造成(\d+)点伤害/g)){counts.damage++;assert(+match[1]<=2,c.name+' damage');}
  for(const match of a.text.matchAll(/抽取(\d+)张卡牌/g)){counts.draw++;assert(+match[1]<=1,c.name+' draw');}
  a.ids.filter(id=>id!=='discardTrigger').forEach(id=>payoffs.add(id));
  for(const t of a.tokens)assert(c.tokens.some(v=>v.id===t.id));
  examples[c.cost<=3?'low':c.cost<=6?'mid':'high']??={name:c.name,chaos};
  assert.deepEqual(c,S.generate(c.name,{chaos}));
 }
 if(c.discardBodyReserve){
  counts.bodyReserve++;const b=c.discardBodyReserve;
  assert(c.cost>=4&&c.type==='follower');assert(b.bonus>0);assert.equal(c.attack+c.health,b.before+b.bonus);assert(c.attack+c.health<=b.target);
  assert(c.abilities.every(a=>a.trigger==='本卡牌被舍弃时'||a.kind==='keyword'&&a.ids.every(id=>['突进','守护'].includes(id))));
  assert(!ids.includes('discardSelfSummon'),'Free self-summons do not receive a paid-play body bonus');
  const key=ids.includes('突进')?'rushBody':'plainBody';counts[key]++;examples[key]??={name:c.name,chaos};
 }
}
for(const key of ['ordinary','low','mid','high','heal','damage','draw'])assert(counts[key]>0,key+' unreachable');assert(payoffs.size>=3);
const report={version:S.VERSION,samples:14000,counts,payoffs:[...payoffs],examples};
fs.writeFileSync(__dirname+'/discard-quality-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

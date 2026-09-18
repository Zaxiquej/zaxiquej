const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
assert.equal(S.overpowerText,undefined);assert.deepEqual(S.generate('设计师您辛苦了',{overpowered:true}),S.generate('设计师您辛苦了'));
const counts={discount:0,draw:0,obtain:0,conditional:0,unconditional:0,nightmareCycle:0,neutralCopy:0},examples={},transform={};
for(let i=0;i<22000;i++){
 const c=S.generate('获牌减费'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(!c.overpowered);assert(c.abilities.length<=5);
 for(const a of [...c.abilities,...c.alternateForms.flatMap(f=>f.abilities||[])]){
  for(const id of ['transformAlly','transformEnemy','transformEither','opponentCopyTransform','handTransform','truthTransform','transformBound'])if(a.ids.includes(id)){transform[id]=(transform[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos,text:a.text};}
  const d=a.acquisitionDiscount;if(!d)continue;
  counts.discount++;counts[d.source]++;counts[d.condition==='none'?'unconditional':'conditional']++;
  assert(a.ids.includes('acquisitionDiscount'));assert(d.discount>=1&&d.discount<=(a.condition==='discardAll'?8:3));assert(d.count>=1);
  assert(Math.abs(d.extraRaw-d.count*d.discount*1.25*d.factor)<1e-8);
  assert(a.raw+(a.drawback?.credit||0)+1e-8>=d.baseRaw+d.extraRaw);
  assert(a.text.includes(`使以此${d.source==='draw'?'抽取':'加入手牌'}的卡牌的费用-${d.discount}。`));
  assert(!a.tokenDelivery?.discount,'No stacked token-delivery discounts');
  if(d.condition==='lowHealth')assert([4,5].includes(c.class));
  if(d.condition==='singleton')assert([0,7].includes(c.class));
  if(d.condition==='overflow')assert.equal(c.class,4);
  if(d.condition!=='none')assert.notEqual(d.condition,a.condition,'A gate already paid by the acquisition cannot discount its modifier again');
  if(a.trigger==='超进化时')assert.notEqual(d.condition,'superUnlocked');
  if(d.condition==='evolutionUnlocked'){assert(!['进化时','超进化时'].includes(a.trigger));assert.notEqual(a.condition,'superUnlocked');}
  if(c.class===5&&a.ids.includes('handRefill')){counts.nightmareCycle++;examples.nightmareCycle??={name:c.name,chaos:!!c.chaos,text:a.text};}
  if(c.class===0&&a.ids.some(id=>['opponentHandCopy','opponentDeckCopy'].includes(id))){counts.neutralCopy++;examples.neutralCopy??={name:c.name,chaos:!!c.chaos,text:a.text};}
 }
 if(i<80)assert.deepEqual(c,S.generate(c.name,{chaos:i%3===0}));
}
for(const key of Object.keys(counts))assert(counts[key]>0,key+' unreachable');
for(const id of ['transformAlly','transformEnemy','transformEither','opponentCopyTransform','handTransform','truthTransform'])assert(transform[id]>0,id+' unreachable');
const report={version:S.VERSION,samples:22000,counts,transform,examples};fs.writeFileSync(__dirname+'/acquisition-discount-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

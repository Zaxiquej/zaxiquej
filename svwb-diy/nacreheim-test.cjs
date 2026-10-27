const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),R=require('./reference'),C=require('./calibration');
assert.equal(R.cards.filter(c=>c.set===10010&&!c.token).length,76);
assert.equal(R.cards.length,982);assert.equal(C.retrieved,R.retrieved);
for(const t of S.PREVIEW.tokens){const official=R.cards.find(c=>c.id===t.id);assert(official);assert.equal(t.text.replace(/\s/g,''),official.text.replace(/\s/g,''));assert.equal(t.cost,official.cost);assert(!t.preview);}
const gate=S.PREVIEW.gate(1,.5,'入场曲');
assert.match(gate.text,/其他原始费用为1/);assert.equal(S.PREVIEW.gate(5,.1,'入场曲'),null);
assert.equal(S.PREVIEW.gate(1,.1,'谢幕曲'),null);
for(const cls of [1,2,3]){const g=S.PREVIEW.gate(cls,.5,'入场曲');assert(S.conditionTerms(g,{cost:3,trigger:'入场曲',abilities:[{condition:g.id}]}).factor>g.factor);}
const counts={},payoffs={},samples={},total=8000;
for(let i=0;i<total;i++){
 const name='全卡包核对'+i,c=S.generate(name,{chaos:i>=7000});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,name+' budget');
 assert(S.boardCapacity(c).valid,name+' slots');require('./assert-node-effects.cjs')(c);
 for(const a of c.abilities){
  const keys=[a.eventPlan?.id,a.optionalDiscard&&'evidenceDiscard',['oneCostBoard','activationHistory'].includes(a.condition)&&a.condition,a.fusionEvent?.effects.includes('evidenceSummon')&&'evidenceFusion'].filter(Boolean);
  for(const key of keys){counts[key]=(counts[key]||0)+1;(payoffs[key]??=new Set()).add(a.ids.join(','));samples[key]??={name,chaos:c.chaos,class:c.class,type:c.type,cost:c.cost,rarity:c.rarity,body:[c.attack,c.health],text:c.abilities.map(a=>a.text)};}
  if(a.eventPlan){assert.equal(c.class,a.eventPlan.id==='activate'?3:7);assert(!a.bodyText.includes('选择'));assert(Math.abs(a.price-a.raw*a.eventPlan.expectedTriggers)<1e-8);}
  if(a.optionalDiscard){assert.equal(c.class,4);assert.equal(a.optionalDiscard.credit,0);assert(!a.optionalDiscard.requiresSuccess);assert.equal(a.price,a.raw);assert(!a.text.includes('若以此'));}
  if(a.fusionEvent?.effects.includes('evidenceSummon')){assert.equal(c.class,7);assert.equal(c.fusion.material,'护符');assert.equal(a.fusionEvent.ppCost,0);assert.equal(a.tokens[0].id,90001210);assert(a.raw<=2.3);}
 }
 if(i%1000===0)assert.deepEqual(c,S.generate(name,{chaos:i>=7000}));
}
for(const key of ['activate','amuletFusion','evidenceDiscard','oneCostBoard','activationHistory','evidenceFusion'])assert(counts[key]>0,key+' unreachable');
assert(payoffs.activate.size>=3);assert(payoffs.amuletFusion.size>=3);
const report={version:S.VERSION,cards:total,counts,payoffs:Object.fromEntries(Object.entries(payoffs).map(([k,v])=>[k,[...v]])),samples};
fs.writeFileSync(__dirname+'/nacreheim-validation.json',JSON.stringify(report,null,2)+'\n');console.log({version:S.VERSION,cards:total,counts});

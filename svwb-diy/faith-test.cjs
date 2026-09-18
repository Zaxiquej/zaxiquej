const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const events=new Set(),classes={},coverage={cards:0,compound:0,emblem:0,hand:0,summon:0,growth:0,crystalHands:0},examples={};
for(let i=0;i<80000;i++){
 const c=S.generate('信仰消费'+i);
 for(const f of c.faiths){
  coverage.cards++;assert.deepEqual(c,S.generate(c.name));assert.equal(f.maxValue,null);
  assert(f.gainRules.length>=1&&f.gainRules.length<=2);if(f.gainRules.length===2)coverage.compound++;
  assert.equal(new Set(f.gainRules.map(g=>g.eventId)).size,f.gainRules.length);
  for(const g of f.gainRules){events.add(g.eventId);(classes[c.class]??=new Set()).add(g.eventId);assert(g.every>=1&&g.every<=4);assert.equal(g.amount,1);}
  const a=c.abilities.find(a=>a.faithIds?.includes(f.id));assert(a,'Every faith needs a payoff');
  const s=a.faithSpend;assert(s.unbounded&&s.amount>0);assert(a.text.includes('消耗'));assert(!a.text.includes('上限'));
  assert(a.raw>=a.minPayoff);assert(c.spent<=c.budget+.011);
  coverage[s.kind]++;examples[s.kind]??=c.name;
  if(s.kind==='emblem'){
   const e=c.emblems.find(e=>a.emblemIds.includes(e.id));assert(e);assert.equal(e.duration,null);
   assert(e.faithIds.includes(f.id));assert.equal(e.faithCost,s.upkeep);assert(e.faithCost>=1);
   assert(e.text.includes('消耗')&&e.text.includes(f.name));assert(e.effects.length>=1);
   assert([null,1,2].includes(e.limit)); // Faith cost is paid on every trigger, even without a quota.
   assert.notEqual(e.id,'emblem-'+c.class);assert(!c.emblems.some(other=>other!==e&&other.name===e.name));
   for(const p of e.effects)if(['artifact','crystalHands'].includes(e.eventId))assert(!p.produces.includes('enter'));
  }else{
   assert(s.snapshot);assert(a.text.includes('发动此能力前')&&a.text.includes('向下取整')&&a.text.includes(`X×${s.amount}`));
   const t=c.tokens.find(t=>t.id===s.tokenId);assert(t);assert(a.text.includes(`『${t.name}』`));
   if(s.kind==='growth')assert(a.text.includes('使其+X/+X'));
   if(t.id===10631110){coverage.crystalHands++;examples.crystalHands??=c.name;assert.equal(c.class,3);}
  }
 }
}
assert(coverage.cards>100&&coverage.cards<800);assert(events.size>=12);assert(coverage.compound>10);
for(const key of ['emblem','hand','summon','growth','crystalHands'])assert(coverage[key]>5,key);
for(const values of Object.values(classes))assert(values.size>=5,'Acquisition must vary within each class');
const report={version:S.VERSION,coverage,events:[...events],classes:Object.fromEntries(Object.entries(classes).map(([k,v])=>[k,[...v]])),examples};
fs.writeFileSync(__dirname+'/faith-validation.json',JSON.stringify(report,null,2));console.log('PASS: randomized faith acquisition, compulsory spend, uncapped conversion, recurring engines, references and loop guards.');console.log(report);

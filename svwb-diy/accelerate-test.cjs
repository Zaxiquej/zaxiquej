const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const fees={},classes=Array.from({length:8},()=>new Set()),coverage={cards:0,modes:0,conditions:0,tokens:0,emblems:0},examples={};
for(let i=0;i<50000;i++){
 const c=S.generate('激奏重组'+i),f=c.alternateForms.find(f=>f.kind==='激奏');if(!f)continue;
 coverage.cards++;assert.deepEqual(c,S.generate(c.name));assert(c.type==='follower'&&f.type==='法术'&&f.cost<c.cost);
 assert(f.cost>=1&&f.cost<=5);assert(f.spent<=f.budget+.011&&f.spent>0);assert(c.spent<=c.budget+.011);
 assert(f.abilities.length>=1&&f.abilities.length<=3);assert(f.abilities.every(a=>a.trigger==='法术'));
 assert(!/本随从|【进化时】|【超进化时】|【激奏|【结晶|【爆能强化|【魔力增幅时】/.test(f.text));
 const ids=f.abilities.flatMap(a=>a.ids);assert.equal(ids.length,new Set(ids).size);
 assert(!ids.includes('selfCopy'));assert.equal(f.text,f.abilities.map(a=>a.text).join('\n\n'));
 for(const a of f.abilities){
  assert(a.raw+1e-8>=(a.minPayoff||0));
  if(a.condition==='combo')assert(c.class===1&&f.cost<=5);
  if(a.condition==='earth')assert.equal(c.class,3);
  if(a.condition==='necromancy')assert.equal(c.class,5);
  for(const t of a.tokens||[])assert.deepEqual(c.tokens.find(v=>v.id===t.id),t);
 }
 for(const id of f.emblemIds){const e=c.emblems.find(e=>e.id===id);assert(e&&f.text.includes(e.name));assert(id.startsWith('accelerate-emblem-'));assert(c.abilities.some(a=>a.kind==='alternate'&&a.emblemIds.includes(id)));}
 const hit=(key,yes)=>{if(yes){coverage[key]++;examples[key]??=c.name;}};
 hit('modes',f.abilities.some(a=>a.mode));hit('conditions',f.abilities.some(a=>a.condition!=='none'));hit('tokens',f.tokens.length);hit('emblems',f.emblemIds.length);
 const bucket=fees[f.cost]??={count:0,texts:new Set(),structures:new Set(),budget:0,spent:0};
 bucket.count++;bucket.texts.add(f.text);bucket.structures.add(ids.join('+'));bucket.budget+=f.budget;bucket.spent+=f.spent;
 classes[c.class].add(ids.join('+'));examples['fee'+f.cost]??=c.name;
}
assert(coverage.cards>400);for(const key of ['modes','conditions','tokens','emblems'])assert(coverage[key]>0,key+' unreachable');
for(const values of classes)assert(values.size>8,'Each class should recompose spells');
for(const [fee,b]of Object.entries(fees)){assert(b.texts.size>15&&b.structures.size>10,'Repeated fixed fee recipe');if(+fee>1)assert(b.budget/b.count>fees[fee-1].budget/fees[fee-1].count);}
const report={version:S.VERSION,coverage,fees:Object.fromEntries(Object.entries(fees).map(([k,b])=>[k,{count:b.count,texts:b.texts.size,structures:b.structures.size,meanBudget:b.budget/b.count,meanSpent:b.spent/b.count}])),classStructures:classes.map(s=>s.size),examples};
fs.writeFileSync(__dirname+'/accelerate-validation.json',JSON.stringify(report,null,2));console.log('PASS: 50,000 seeds; independent spell budgets, costs/classes, mode/condition diversity, attachment identity, references, no recursive forms.');console.log(report);

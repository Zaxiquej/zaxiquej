const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('./engine');
const app=fs.readFileSync(__dirname+'/app.js','utf8'),ctx={};vm.runInNewContext(app.slice(app.indexOf('function displayAbilities'),app.indexOf('function cardText')),ctx);
let state=482;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
const counts={events:0,experiment:0,sameAtom:0},families={},fees={},classes=new Set(),examples={};
for(let i=0;i<6000;i++){
 const name=i<3000?S.randomMatchingName({class:3,type:'follower',rarity:2,costBand:'4-6'},{random}):'融合事件'+i;
 const c=S.generate(name),f=c.fusion;
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,name+' budget');
 assert(c.abilities.length<=5);const ids=c.abilities.flatMap(a=>a.ids);require('./assert-node-effects.cjs')(c);
 if(f?.mode!=='event')continue;
 counts.events++;classes.add(c.class);fees[f.ppCost]=(fees[f.ppCost]||0)+1;
 const a=c.abilities.find(a=>a.fusionEvent);assert(a);assert.equal(c.type,'follower');assert(c.cost>=3);assert(f.oncePerTurn);
 assert.equal(a.price,f.flexibility+Math.max(.7,f.payoffRaw-f.ppCost*2.2-f.materialCredit)*f.repeats);
 assert(!/选择|本随从\+|NaN|undefined|\$/.test(a.bodyText),name+' invalid in-hand event');
 if(f.ppCost)assert(a.text.includes(`若自己的剩余能量点为${f.ppCost}或以上，则消耗${f.ppCost}点能量点，`));
 else assert(!a.text.includes('消耗'));
 assert.equal(ctx.displayAbilities(c)[0].text,'【融合】'+f.material);
 for(const id of f.effects){families[id]=(families[id]||0)+1;examples[id]??=name;}
 if(f.experiment){
  counts.experiment++;assert.equal(c.class,3);
  const partner=c.abilities.find(a=>a.fusionPartner);assert(partner);assert(['入场曲','进化时'].includes(partner.trigger));
  assert(partner.ids.some(id=>id.startsWith('experiment')));assert(partner.text.includes('沉溺的实验体'));
  assert(c.tokens.some(t=>t.id===10931110));assert.equal(partner.price,f.partner.price);
  if(partner.ids.some(id=>f.effects.includes(id)))counts.sameAtom++;
  examples.experiment??=name;
 }
 assert.deepEqual(c,S.generate(name));
}
assert(counts.events>40&&counts.experiment>0&&counts.sameAtom>0);assert(Object.keys(families).length>=6);assert(classes.size>=4);for(const fee of [0,1,2])assert(fees[fee]>0);
assert(families.draw>0&&families.boost>0&&families.tokenSummon>0&&families.handBuff>0);
const report={version:S.VERSION,samples:6000,counts,families,fees,classes:[...classes],examples};fs.writeFileSync(__dirname+'/fusion-event-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

const assert=require('node:assert/strict'),S=require('./engine'),R=require('./reference.json'),report=require('./late-diversity-validation.json');
const official=R.cards.filter(c=>!c.token&&c.type===1&&c.cost>=7);
assert.deepEqual([1,2,3,4].map(r=>official.filter(c=>c.rarity===r).length),[17,21,17,70]);
assert.equal(report.after.version,S.VERSION);
assert(report.after.counts.aoe<report.before.counts.aoe*.5);
assert(report.after.counts.selfCopy<report.before.counts.selfCopy*.5);
let checked=0,paired=0,advanced=0;const rarity=[0,0,0,0];
for(let i=0;checked<1000;i++){
 const name='终局结构回归'+i,options={chaos:checked>=700},h=S.header(name,options);
 if(h.type!=='follower'||h.cost<7)continue;
 const c=S.generate(name,options);checked++;
 if(checked<=700)rarity[c.rarity]++;
 assert(Number.isInteger(c.attack)&&Number.isInteger(c.health)&&c.health>=1,name);
 assert(c.spent+c.attack+c.health<=c.budget+.02,name+' budget');
 assert(c.abilities.length<=5,name+' slots');
 require('./assert-node-effects.cjs')(c);
 if(c.simpleDesign){
  assert.equal(c.rarity,0);
  for(const a of c.abilities.filter(a=>a.kind==='core'))assert((a.components?.length||1)<=2,name+' bronze core complexity');
 }
 for(const a of c.abilities){
  if(a.kind==='core'&&a.components?.length===2)paired++;
  if(a.ids.some(id=>['restoreEP','restoreSEP','handTransform','truthTransform','leaderVulnerability','amuletRevive','artifactCopy'].includes(id)))advanced++;
  if(a.ids.includes('selfCopy')&&a.trigger==='谢幕曲')assert(a.text.includes('失去【谢幕曲】'));
 }
 if(checked%200===0)assert.deepEqual(c,S.generate(name,options));
}
assert(paired>40&&advanced>5);
assert(Math.abs(rarity[3]/700-70/125)<.08,'High-cost rarity should follow its own official cohort');
// Defensive bodies and delayed resources must contribute, without making a
// large vanilla body pass as an impactful late-game card.
const defender={attack:7,health:11,abilities:[{kind:'keyword',ids:['守护']},{kind:'effect',trigger:'谢幕曲',condition:'none',ids:['draw'],raw:9}]};
assert(S.highCostReadiness(defender)>9);
assert.equal(S.highCostReadiness({...defender,abilities:[]}),0);
console.log('PASS: late diversity, complexity, budgets, atomic effects, deterministic seeds and rarity.',{checked,paired,advanced,rarity});

const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const events=new Set(),classes={},coverage={cards:0,compound:0,upgrade:0,emblem:0,hand:0,summon:0,growth:0,crystalHands:0},examples={},royalTokens={};
for(let i=0;i<160000;i++){
 const name='信仰消费'+i,h=S.header(name);
 if(h.type!=='follower'||h.rarity!==3||h.cost<2||![1,2,3,5,6].includes(h.class))continue;
 const c=S.generate(name);
 for(const f of c.faiths){
  coverage.cards++;assert.deepEqual(c,S.generate(c.name));assert.equal(f.maxValue,null);
  assert(f.gainRules.length>=1&&f.gainRules.length<=2);if(f.gainRules.length===2)coverage.compound++;
  assert.equal(new Set(f.gainRules.map(g=>g.eventId)).size,f.gainRules.length);
  for(const g of f.gainRules){events.add(g.eventId);(classes[c.class]??=new Set()).add(g.eventId);assert(g.every>=1&&g.every<=4);assert.equal(g.amount,1);}
  const a=c.abilities.find(a=>a.faithIds?.includes(f.id));assert(a,'Every faith needs a payoff');
  const s=a.faithSpend;assert(s.unbounded&&s.amount>0);assert(a.text.includes('消耗'));assert(!a.text.includes('上限'));
  if(s.profile){
   assert(s.profile.priceFactor>=.72);assert(a.price>=a.raw*.72-.011);
   assert(s.amount===s.profile.unlock&&s.cadence===s.profile.cadence);
   if(s.faceDamage&&s.profile.eventRate>1)assert(s.cadence>=s.faceDamage);
   if(s.cadence>1)assert(a.text.includes(`累计发生${s.cadence}次`)||c.emblems.some(e=>e.text.includes(`累计发生${s.cadence}次`)));
  }
  assert(a.raw>=a.minPayoff);assert(c.spent<=c.budget+.011);
  coverage[s.kind]++;examples[s.kind]??=c.name;
  if(s.kind==='emblem'){
   const e=c.emblems.find(e=>a.emblemIds.includes(e.id));assert(e);assert.equal(e.duration,null);
   assert(e.faithIds.includes(f.id));assert.equal(e.faithCost,0);assert.equal(s.upkeep,0);
   assert(!e.text.includes('消耗'));assert(e.effects.length>=1);
   assert.equal(e.limit,null);assert(s.rewardRaw>=4);assert(a.text.includes('或以上'));
   assert.notEqual(e.id,'emblem-'+c.class);assert(!c.emblems.some(other=>other!==e&&other.name===e.name));
   for(const p of e.effects)if(['enter','crystalHands','death','amuletDeath','draw'].includes(e.eventId))assert(!p.produces.includes('enter'));
  }else if(s.kind==='upgrade'){
   assert(f.upgrade);assert.equal(s.upkeep,0);assert(s.rewardRaw>=4);
   assert(f.upgrade.stackable);assert(!f.upgrade.unique);assert(!a.text.includes('不重复叠加'));
   assert.equal(s.profile.stackPremium,1.2);
   assert(a.text.includes(f.upgrade.text)&&a.text.includes('获得'));
   if(['enter','crystalHands','death','amuletDeath','draw'].includes(f.upgrade.eventId))assert(!f.upgrade.effects.includes('tokenSummon'));
   if(f.upgrade.eventId==='heal')assert(!f.upgrade.effects.includes('heal'));
   assert(!f.upgrade.text.slice(f.upgrade.eventText.length).includes('选择'));
  }else{
   assert(s.snapshot);assert(a.text.includes('发动此能力前')&&a.text.includes('向下取整')&&a.text.includes(`X×${s.amount}`));
   const t=c.tokens.find(t=>t.id===s.tokenId);assert(t);assert(a.text.includes(`『${t.name}』`));
   if(c.class===2){
    royalTokens[t.name]=(royalTokens[t.name]||0)+1;
    if(t.type==='spell')assert.equal(s.kind,'hand','Faith must not summon or buff a spell');
    if(t.type==='amulet'){assert.notEqual(s.kind,'growth');if(s.kind==='summon')assert(a.text.includes('召唤X张'));}
    if(t.id===90021350)assert(s.amount>=2,'Coins must not use the cheap Knight exchange price');
   }
   if(s.kind==='growth')assert(a.text.includes('使其+X/+X'));
   if(t.id===10631110){coverage.crystalHands++;examples.crystalHands??=c.name;assert.equal(c.class,3);}
  }
 }
}
console.log('Faith coverage:',coverage);
assert(coverage.cards>30&&coverage.cards<800);assert(events.size>=12);assert(coverage.compound>5);
for(const key of ['upgrade','emblem','hand','summon','growth','crystalHands'])assert(coverage[key]>0,key);
for(const [cls,values] of Object.entries(classes))assert(values.size>=5,`Acquisition must vary within class ${cls}: ${[...values]}`);
assert(Object.keys(royalTokens).length>=4,'Royal faith must offer varied token conversions');
const royalTotal=Object.values(royalTokens).reduce((a,b)=>a+b,0);
assert((royalTokens['骑士']||0)/royalTotal<.5,'Knights must not dominate Royal faith conversion');
const report={version:S.VERSION,coverage,events:[...events],classes:Object.fromEntries(Object.entries(classes).map(([k,v])=>[k,[...v]])),royalTokens,examples};
fs.writeFileSync(__dirname+'/faith-validation.json',JSON.stringify(report,null,2));console.log('PASS: randomized faith acquisition, compulsory spend, uncapped conversion, recurring engines, references and loop guards.');console.log(report);

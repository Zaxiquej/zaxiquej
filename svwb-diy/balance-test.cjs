const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const high=[],limits={unlimited:0,one:0,two:0};let stackedReplay=0,chains=0;
for(let i=0;i<12000;i++){
 const c=S.generate('叠加检查'+i);
 if(c.type==='follower'&&c.cost>=6&&c.rarity===3)high.push(c.abilities.reduce((s,a)=>s+a.raw,0));
 for(const e of c.emblems)if(!['start','end'].includes(e.eventId)){
  limits[e.limit===null?'unlimited':e.limit===1?'one':'two']++;
  const feedback=e.effects.some(p=>p.id==='supply'&&['fairy','crystalHands','artifact','tribeEnter'].includes(e.eventId)||p.id==='summon'&&['death','ward'].includes(e.eventId)||p.id==='earth'&&e.eventId==='earth');
  if(feedback)assert.equal(e.limit,1,'Self-supplying engines retain a quota');
 }
 for(const a of c.abilities){
  if(a.ids.includes('randomAssembly')){chains++;assert.equal(a.price,a.raw,'Random chains must pay their full expected value');}
  if(a.kind==='replay'&&c.abilities.some(b=>b!==a&&['进化时','超进化时'].includes(b.trigger))){stackedReplay++;assert(a.timingFactor>.38,'Another evolution payoff must share the discount');}
 }
}
high.sort((a,b)=>a-b);
const report={version:S.VERSION,sample:12000,limits,stackedReplay,chains,highRarityMean:high.reduce((s,v)=>s+v,0)/high.length,highRarityP95:high[Math.floor(high.length*.95)],previousP95:46.2208};
assert(stackedReplay>0&&chains>0,JSON.stringify({stackedReplay,chains}));
assert(limits.unlimited>50&&limits.two>40&&limits.one>40);
assert(report.highRarityP95<report.previousP95*.9,'Upper-tail stacking should fall, not just rename the budget');
fs.writeFileSync(__dirname+'/balance-validation.json',JSON.stringify(report,null,2));
console.log('PASS: 12,000 seeds; emblem frequency diversity, feedback quotas, shared evolution discounts, chain pricing, lower upper-tail payoff.');console.log(report);

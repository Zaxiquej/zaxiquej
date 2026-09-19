const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const baseline=require('./cheap-board-baseline.json');
const fixed=S.generate(baseline.name);
assert(!fixed.abilities.some(a=>a.condition==='none'&&a.text.includes('召唤2个『泥尘巨像』')));
const counts={priced:0,premium:0,twoCostSmallPair:0,threeCostGolemPair:0,delayed:0,hand:0},examples={};
for(let i=0;i<16000;i++){
 const c=S.generate('铺场估值'+i);
 assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 for(const a of c.abilities){
  if(c.cost<=3&&a.ids.includes('tokenHand'))counts.hand++;
  if(c.cost<=3&&a.ids.includes('tokenSummon')&&['谢幕曲','进化时','超进化时'].includes(a.trigger))counts.delayed++;
  const b=a.summonBoard;if(!b)continue;counts.priced++;
  const premium=.9*(Math.max(0,b.previousStats+b.stats-2*b.effectiveCost)-Math.max(0,b.previousStats-2*b.effectiveCost));
  assert(Math.abs(premium-b.premium)<1e-8,c.name+' premium');
  assert(a.raw+.001>=b.baseRaw+b.premium,c.name+' raw value');
  if(b.premium>0)counts.premium++;
  if(c.cost===2&&a.condition==='none'){
   const t=a.tokens.find(t=>t.id===b.tokenId);
   assert(!(b.count>=2&&t.attack>=2&&t.health>=2),c.name+' unconditional two-cost double 2/2');
   if(b.count>=2&&b.stats<=4){counts.twoCostSmallPair++;examples.smallPair??=c.name;}
  }
  if(c.cost===3&&b.tokenId===90031110&&b.count===2){counts.threeCostGolemPair++;examples.golemPair??=c.name;}
 }
}
for(const [k,v]of Object.entries(counts))assert(v>0,k+' coverage');
assert.deepEqual(S.generate(fixed.name),fixed);
fs.writeFileSync(__dirname+'/cheap-board-validation.json',JSON.stringify({version:S.VERSION,seeds:16000,counts,examples,fixed},null,2));
console.log('PASS',counts,examples);

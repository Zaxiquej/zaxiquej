const assert=require('node:assert/strict'),S=require('./engine');
// Independently inspect cheap generated armies, including X payoffs at their
// cap. Metadata-only tests would miss a summon atom that forgot boardValue.
let generated=0,fusions=0,summons=0,scaled=0,compound=0;
for(let i=0;i<60000;i++){
 const name='融合校准'+i,h=S.header(name);
 if(h.type!=='follower'||h.cost>4||h.rarity<1)continue;
 const c=S.generate(name),f=c.fusion;generated++;
 if(!f||f.mode==='event')continue;
 fusions++;if(f.mode==='count')scaled++;if(f.effects.length>1)compound++;
 const a=c.abilities.find(a=>a.kind==='fusion');
 let armyValue=0;
 for(const match of a.bodyText.matchAll(/召唤(\d+|X)个『([^』]+)』/g)){
  const t=c.tokens.find(t=>t.name===match[2]);if(!t)continue;
  const count=match[1]==='X'?f.cap:Number(match[1]);
  armyValue+=S.tokenValue(t)*count;summons++;
 }
 assert(armyValue<=(c.cost<=3?6:9)+1e-8,c.name+' excessive cheap fusion army');
 assert(c.spent+c.attack+c.health<=c.budget+.02,c.name+' total allowance');
 assert(a.price>=a.raw*(c.cost<=3?.9:.82)-1.8-1e-8);
 // A second material must not promote a 3-PP payoff to the 4-PP pool.
 if(c.cost===3&&f.mode==='threshold')assert(!/召唤[2-9]个『神秘的创造物』/.test(a.text));
}
assert(fusions>30&&summons>5&&scaled>5&&compound>5,'keep varied cheap fusion designs reachable');
for(const name of ['融合校准3273','融合校准7484','融合校准7970']){
 const c=S.generate(name),a=c.abilities.find(a=>a.kind==='fusion');
 assert(!a||(a.boardValue||0)<=6,'existing over-budget design: '+name);
}
console.log('PASS: cheap fusion armies, scaling and compound payoffs stay bounded.',{generated,fusions,summons,scaled,compound});

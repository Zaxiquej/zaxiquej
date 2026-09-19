const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),before=require('./model496-baseline.json');
// The reported 5/7/7 + two 1/1 bodies must share one tempo allowance.
const example={abilities:[{trigger:'入场曲',condition:'none',raw:3.6,price:3.6,boardValue:3.6}]};
assert.equal(S.immediateBoardValue(example),3.6);assert(14+S.immediateBoardValue(example)>3*5-1);
const counts={midPayments:0,fusionSummons:0,cheapFusionSummons:0},discount={},rules=new Set(),misses=new Set();
for(let i=0;i<8000;i++){
 const c=S.generate('模型审计496-'+i);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(c.midBoardTrade){const m=c.midBoardTrade;assert(c.attack+c.health<=m.cap+(c.stationaryDesign?.bodyBonus||0),c.name+' combined tempo cap');if(m.lost)counts.midPayments++;assert(c.attack>=0&&c.health>=1);}
 if(c.handTrigger?.payoff==='discount')discount[c.cost]=(discount[c.cost]||0)+1;
 const f=c.fusion;
 if(f?.mode==='event'){
  assert(f.payoffRaw<=f.ppCost*2.4+1.6+1e-8,c.name+' independent fusion payment');
  if(f.summon){counts.fusionSummons++;assert(f.summon.stats<=[2,3,5][f.ppCost]);if(f.ppCost<=1){counts.cheapFusionSummons++;assert(!(f.summon.tokenId===90031110),c.name+' cheap Mud Golem');}}
 }
 for(const e of c.emblems.filter(e=>e.luck?.kind==='drawCost')){
  const l=e.luck;rules.add(l.rule.kind);misses.add(l.missKind);
  assert.equal(new Set([...l.hitCosts,...l.missCosts]).size,11);assert(!l.hitCosts.some(n=>l.missCosts.includes(n)));
  assert(!/抽取\d+张|抽取X张|加入手牌/.test(e.text),'No recursive draw rewards');
  assert(l.probability>=.18&&l.probability<=.82);
  if(l.missKind==='none')assert.equal(e.text.split('自己抽取卡牌时').length,2);
  if(l.missKind==='own')assert(l.missRaw>0&&l.downsideValue===0);
 }
 if(i<50)assert.deepEqual(S.generate(c.name),c);
}
assert(counts.midPayments>20&&counts.fusionSummons>0);
const mean=o=>Object.entries(o).reduce((s,[k,n])=>s+Number(k)*n,0)/Object.values(o).reduce((a,b)=>a+b,0);
assert(mean(discount)>mean(before.discount)+1,'Discount engines should shift towards expensive cards');
assert((discount[2]||0)+(discount[3]||0)<(before.discount[2]+before.discount[3])*.45);
assert(S.discountFrequency(2)<S.discountFrequency(4)&&S.discountFrequency(4)<S.discountFrequency(7));
const report={version:S.VERSION,samples:8000,counts,discount,beforeDiscount:before.discount,meanBefore:mean(before.discount),meanAfter:mean(discount),rules:[...rules],misses:[...misses]};
fs.writeFileSync(__dirname+'/model496-validation.json',JSON.stringify(report,null,2));console.log('PASS',report);

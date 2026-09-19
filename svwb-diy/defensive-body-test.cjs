const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
assert(S.keywordPrice('毁灭',0,2)>S.keywordPrice('毁灭',3,2));
const counts={bane:0,barrier:0,barrierWard:0,attackEngine:0,zeroAttackTrigger:0,zeroBane:0,zeroBarrierWard:0,lowBarrier:0},examples={};
let state=480;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<10000;i++){
 const name=S.randomMatchingName({type:'follower',costBand:'0-3'},{random}),c=S.generate(name),has=k=>c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes(k));
 assert(c.attack+c.health+c.spent<=c.budget+.02,name+' budget');assert(c.abilities.length<=5);
 require('./assert-node-effects.cjs')(c);
 if(c.defensiveBody){
  counts[c.defensiveBody.design]++;assert(c.cost<=3);assert(c.attack<=1);assert(c.abilities.some(a=>a.trigger));
  for(const a of c.abilities.filter(a=>a.kind==='keyword'&&a.ids.some(k=>['毁灭','屏障'].includes(k))))
   assert.equal(a.price,S.keywordPrice(a.ids[0],c.attack,c.health,{ward:has('守护'),rush:has('突进')}));
 }
 for(const [key,condition]of [['zeroBane',c.attack===0&&has('毁灭')],['zeroBarrierWard',c.attack===0&&has('屏障')&&has('守护')],['lowBarrier',c.attack===1&&has('屏障')]])if(condition){counts[key]++;examples[key]??=name;}
 if(c.attack===0)assert(c.zeroAttackTrade&&c.zeroAttackTrade.lost>0);
 if(c.attack===0&&c.abilities.some(a=>a.trigger==='攻击时')){counts.zeroAttackTrigger++;examples.zeroAttackTrigger??=name;}
 if(has('屏障')&&c.cost===2)assert(c.attack+c.health<=3);
 if(i%100===0)assert.deepEqual(c,S.generate(name));
}
for(const [key,n]of Object.entries(counts))assert(n>0,key+' unreachable');
const report={version:S.VERSION,samples:10000,counts,examples};fs.writeFileSync(__dirname+'/defensive-body-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

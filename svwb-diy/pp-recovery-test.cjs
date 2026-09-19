const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
let state=488;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
const counts={},examples={};
for(const cls of [0,4])for(let i=0;i<4000;i++){
 const c=S.generate(S.randomMatchingName({class:cls,type:'follower',costBand:'7+'},{random}));
 assert(c.attack+c.health+c.spent<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 for(const a of c.abilities){
  for(const m of a.text.matchAll(/回复自己([1-3])点能量点。/g)){
   const n=+m[1],key=cls+':'+n;counts[key]=(counts[key]||0)+1;examples[key]??=c.name;
   assert(n<=(c.cost>=8?3:c.cost>=5?2:1),c.name+' amount');
   assert(!['谢幕曲','启动'].includes(a.trigger),c.name+' recovery timing');
  }
  for(const part of a.components||[])if(part.id==='pp')assert.equal(part.raw,+part.text.match(/\d+/)[0]*3.5);
 }
}
for(const cls of [0,4])for(const n of [1,2,3])assert(counts[cls+':'+n]>0,'Missing PP amount '+cls+':'+n);
for(const name of Object.values(examples))assert.deepEqual(S.generate(name),S.generate(name));
fs.writeFileSync(__dirname+'/pp-recovery-validation.json',JSON.stringify({version:S.VERSION,seeds:8000,counts,examples},null,2));console.log('PASS',counts,examples);

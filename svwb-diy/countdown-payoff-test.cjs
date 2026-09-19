const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const baseline=require('./countdown-payoff-baseline.json');
for(const old of baseline){const c=S.generate(old.name);assert(c.spent>old.spent,old.name);assert(c.spent>=c.budget*.68-.01,old.name+' improved payload');}
let state=487;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
const counts={countdown:0,death:0,weak:0,cheapSummon:0,activation:0};
for(let i=0;i<4000;i++){
 const c=S.generate(S.randomMatchingName({type:'amulet',costBand:'0-3'},{random}));
 assert.deepEqual(c,S.generate(c.name));assert(c.spent<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(!c.countdown)continue;counts.countdown++;
 if(c.abilities.some(a=>a.trigger==='启动'))counts.activation++;
 const death=c.abilities.find(a=>a.trigger==='谢幕曲');if(!death)continue;counts.death++;
 assert(!death.text.includes('选择')&&!death.text.includes('【模式】'),c.name+' automatic death');
 if(c.spent<c.budget*.55)counts.weak++;
 if(c.cost===2&&death.ids.includes('tokenSummon')){
  counts.cheapSummon++;
  assert(!(c.countdown>=3&&death.text==='【谢幕曲】召唤1个『怨灵』。'&&c.abilities.some(a=>/使其\+0\/\+1/.test(a.text))),c.name+' reported weak structure');
 }
}
assert(counts.countdown>500&&counts.death>300&&counts.activation>50&&counts.cheapSummon>10);
assert(counts.weak/counts.death<.04,'Underfilled countdown payoffs should be rare');
fs.writeFileSync(__dirname+'/countdown-payoff-validation.json',JSON.stringify({version:S.VERSION,seeds:4000,counts},null,2));console.log('PASS',counts);

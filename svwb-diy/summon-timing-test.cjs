const assert=require('node:assert/strict'),S=require('./engine');
const check=require('./assert-node-effects.cjs');
const ref=require('./reference.json');
for(const t of S.TOKENS){
 const original=ref.cards.find(c=>c.id===t.id);
 for(const key of ['text','attack','health','cost'])assert.equal(t[key],original[key]);
}
const counts={endSummons:0,endCycles:0,endSignatures:0,activeRush:0,activeStorm:0,handStorm:0};
for(let i=0;i<10000;i++){
 const opts={chaos:i%2===0},c=S.generate('召唤时点508-'+i,opts);
 check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities){
  if(a.ids.includes('handStorm'))counts.handStorm++;
  if(/回合结束|对手的回合/.test(a.trigger)){
   assert(!/使这些随从获得[^。]*【(?:疾驰|突进)】/.test(a.text),c.name+' '+a.text);
   assert(!a.ids.includes('grantRush'),c.name+' '+a.text);
   if(/召唤/.test(a.text))counts.endSummons++;
   if(a.kind==='cycle')counts.endCycles++;
   if(a.kind==='signature')counts.endSignatures++;
  }else if(a.trigger!=='在手牌中发动'){
   if(a.ids.includes('summonRush'))counts.activeRush++;
   if(a.ids.includes('summonStorm'))counts.activeStorm++;
  }
 }
 if(i<40)assert.deepEqual(c,S.generate(c.name,opts));
}
for(const [key,n] of Object.entries(counts))assert(n>0,'Missing coverage: '+key);
console.log({version:S.VERSION,samples:10000,counts});

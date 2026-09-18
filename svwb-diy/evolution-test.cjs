const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const coverage={selfEvolve:0,allyEvolve:0,teamEvolve:0,selfSuperEvolve:0,evolutionEvent:0,singleton:0,lowHealth:0,conditionBoard:0},examples={};
for(let i=0;i<70000;i++){
 const c=S.generate('自动进化'+i);
 for(const a of [...c.abilities,...c.alternateForms.flatMap(f=>f.abilities||[])]){
  for(const id of ['selfEvolve','allyEvolve','teamEvolve','selfSuperEvolve','evolutionEvent'])if(a.ids.includes(id)){
   coverage[id]++;examples[id]??=c.name;
   if(id==='selfEvolve'||id==='selfSuperEvolve'){
    assert(c.type==='follower');assert(['入场曲','爆能强化','自己的回合结束时'].includes(a.trigger));assert(c.cost>=2);
    if(a.condition==='none')assert(c.cost>=5);
    if(id==='selfSuperEvolve')assert(c.cost>=7&&c.rarity===3);
    assert(!c.abilities.some(v=>['进化时','超进化时'].includes(v.trigger)),'Do not confuse self-evolution with EP/SEP keyword triggers');
   }
   if(id==='allyEvolve'){assert(a.text.includes('进化前'));if(a.trigger==='谢幕曲')assert(!a.text.includes('选择'));}
   if(id==='teamEvolve')assert(c.rarity>=2);
   if(id==='evolutionEvent'){
    assert.equal(a.trigger,'本随从进化时');assert(a.text.startsWith('本随从进化时，'));
    assert(c.abilities.some(v=>v.ids.includes('selfEvolve')||v.ids.includes('selfSuperEvolve')));
    assert(!a.ids.some(id=>['selfEvolve','allyEvolve','teamEvolve','selfSuperEvolve'].includes(id)));
   }
  }
  if(a.minPayoff&&['singleton','lowHealth'].includes(a.condition)){
   coverage[a.condition]++;assert(a.raw+1e-8>=a.minPayoff);assert(a.minPayoff>=5.5);
   if(a.condition==='singleton')assert([0,7].includes(c.class));else assert([4,5].includes(c.class));
  }
 }
 if(c.type==='follower'&&c.cost<=4){
  const board=c.abilities.filter(a=>a.trigger==='入场曲'&&a.boardValue>0);
  if(board.length&&board.every(a=>['singleton','lowHealth'].includes(a.condition))){coverage.conditionBoard++;assert(!c.boardBodyTrade);}
 }
}
for(const [k,n]of Object.entries(coverage))assert(n>0,k+' unreachable');
const report={version:S.VERSION,coverage,examples};fs.writeFileSync(__dirname+'/evolution-validation.json',JSON.stringify(report,null,2));console.log('PASS: auto-evolution coverage, valid timings/targets, distinct evolution events, loop exclusions, strong class conditions and body exemption.');console.log(report);

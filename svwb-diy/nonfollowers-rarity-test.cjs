const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs');
const helper=new Set(['enhance','activate','lastWordsAct','countdownAct']);
const stats=Object.fromEntries(['spell','amulet'].map(t=>[t,Array.from({length:4},()=>({n:0,effects:0,length:0,high:0,weak:0}))]));
let bronze=0;const examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('非随从稀有度'+i);if(c.type==='follower')continue;
 const effects=c.abilities.reduce((n,a)=>n+(a.kind==='keyword'?0:a.ids.filter(id=>!helper.has(id)).length),0);
 assert(effects<=c.effectLimit,c.name+' '+effects);assert(c.spent<=c.budget+.011);
 const s=stats[c.type][c.rarity];s.n++;s.effects+=effects;s.length+=c.abilities.map(a=>a.text).join('').length;
 if(c.cost>=7){s.high++;if(c.spent/c.budget<.5)s.weak++;}
 if(c.rarity!==0)continue;bronze++;assert(effects<=2);assert.equal(c.emblems.length,0);
 for(const a of c.abilities){
  assert.equal(a.condition,'none');assert(!a.text.includes('【模式】'));assert(a.kind!=='mode');
  assert(a.ids.filter(id=>!helper.has(id)).length<=1,'No compound payload hidden inside one paragraph');
  if(a.engineSpec){assert(['start','end'].includes(a.engineSpec.eventId));assert.equal(a.engineSpec.effects.length,1);}
 }
 if(c.cost>=6)examples[c.type]??=c.name;
}
for(const groups of Object.values(stats))for(let r=1;r<4;r++){
 assert(groups[r].effects/groups[r].n>groups[r-1].effects/groups[r-1].n);
 assert(groups[r].length/groups[r].n>groups[r-1].length/groups[r-1].n);
}
const regression=S.generate('泥尘巨像');assert.equal(regression.rarity,0);assert(regression.abilities.length<=2);assert(regression.spent/regression.budget>=.5);
const report={version:S.VERSION,bronze,stats,examples,regression:regression.abilities.map(a=>a.text)};fs.writeFileSync(__dirname+'/nonfollowers-rarity-validation.json',JSON.stringify(report,null,2));console.log('PASS: bronze semantic effect caps, simple ongoing engines, rarity-scaled count/complexity, source budgets and reported card regression.');console.log(report);

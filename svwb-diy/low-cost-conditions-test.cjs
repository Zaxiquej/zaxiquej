const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const baseline=require('./low-cost-conditions-baseline.json');
const stats={cards:0,conditional:0,strong:0,raw:0},counts={evolvedBoard:0,superEvolvedBoard:0},examples={},types=new Set(),payoffs=new Set();
for(let i=0;i<15000;i++){
 const c=S.generate('低费条件'+i);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5);assert.deepEqual(c,S.generate(c.name));
 if(i<baseline.samples&&c.cost>=1&&c.cost<=2){
  stats.cards++;
  const a=c.abilities.filter(a=>a.condition&&a.condition!=='none'&&['入场曲','法术','谢幕曲'].includes(a.trigger));
  if(a.length){stats.conditional++;stats.raw+=Math.max(...a.map(a=>a.raw));if(a.some(a=>a.raw>=3.5))stats.strong++;}
 }
 for(const a of c.abilities){
  if(!Object.hasOwn(counts,a.condition))continue;
  counts[a.condition]++;types.add(c.type);a.ids.forEach(id=>payoffs.add(id));
  const stage=a.condition==='superEvolvedBoard'?'超进化':'进化';
  if(a.acquisitionDiscount){assert.notEqual(a.acquisitionDiscount.condition,'evolutionUnlocked');if(stage==='超进化')assert.notEqual(a.acquisitionDiscount.condition,'superUnlocked');}
  assert(a.text.includes(`若自己的战场上有${c.type==='follower'&&a.trigger!=='谢幕曲'?'其他':''}${stage}后的随从，则`));
  assert(a.raw+1e-8>=Math.max(a.minPayoff||0,stage==='超进化'?3.5:2.5));
  assert(!a.text.includes('进化点'),'Board presence is distinct from remaining EP');
  if(c.cost<=2&&c.rarity===0&&['入场曲','谢幕曲'].includes(a.trigger))assert(a.ids.length<=1,'Cheap bronze arrival/death payoff stays simple');
  examples[a.condition]??={name:c.name,chaos:false,cost:c.cost,text:a.text};
  examples[c.type]??={name:c.name,chaos:false,cost:c.cost,text:a.text};
  if(c.cost<=2&&a.raw>=3.5)examples.cheapStrong??={name:c.name,chaos:false,cost:c.cost,text:a.text};
 }
}
assert.equal(stats.cards,baseline.stats.cards);
assert(stats.conditional>baseline.stats.conditional*1.15,'More cheap cards should use real conditions');
assert(stats.strong>baseline.stats.strong*1.15,'More cheap gated payoffs should be meaningful');
assert(counts.evolvedBoard>0&&counts.superEvolvedBoard>0&&types.size===3&&payoffs.size>=5);
const report={version:S.VERSION,samples:15000,baseline,stats,counts,types:[...types],payoffs:[...payoffs],examples};
fs.writeFileSync(__dirname+'/low-cost-conditions-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

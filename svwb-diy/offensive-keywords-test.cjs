const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const baseline=require('./offensive-keywords-baseline.json'),counts={storm:0,threat:0,both:0,handStormBoth:0};
for(const name of baseline.names){
 const c=S.generate(name),ids=c.abilities.flatMap(a=>a.ids);
 assert(c.attack+c.health+c.spent<=c.budget+.02,name+' budget');
 require('./assert-node-effects.cjs')(c);
 counts.storm+=ids.includes('疾驰');counts.threat+=ids.includes('威慑');
 counts.both+=ids.includes('疾驰')&&ids.includes('威慑');
 counts.handStormBoth+=ids.includes('handStorm')&&ids.includes('威慑');
 if(ids.includes('疾驰'))assert(S.stormCardValue(c.attack,c.health,c.abilities).value<=c.cost+1e-8,name+' storm balance');
}
assert(counts.both>0,'Rare combinations remain possible');
assert(counts.both<baseline.counts.both*.3,'Forced stacking removed');
assert(counts.both/counts.storm<.1,'Storm + Intimidate should be uncommon');
// v4.94 removes forced high-cost keywords; compare availability to official
// printed rates rather than preserving the old inflated absolute counts.
const official=require('./reference.json').cards.filter(c=>!c.token&&c.type===1&&c.cost>=7);
const printedRate=k=>official.filter(c=>new RegExp('^【'+k+'】','m').test(c.text)).length/official.length;
assert(Math.abs(counts.storm/baseline.names.length-printedRate('疾驰'))<.06,'Keep Storm near the official printed rate');
assert(counts.threat-counts.both>baseline.names.length*printedRate('威慑')*.5,'Keep standalone Intimidate available');
fs.writeFileSync(__dirname+'/offensive-keywords-validation.json',JSON.stringify({version:S.VERSION,seeds:baseline.names.length,before:baseline.counts,after:counts},null,2));console.log('PASS',counts);

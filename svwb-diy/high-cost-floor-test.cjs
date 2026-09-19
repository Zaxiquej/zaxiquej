const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const old=require('./high-cost-floor-baseline.json');
for(const c of old){const n=S.generate(c.name);assert(n.highCostFloor,c.name);assert(S.highCostReadiness(n)>S.highCostReadiness(c));assert.deepEqual(S.generate(n.name),n);}
// Reproduce the reported structure, independent of its unavailable seed.
const reported={attack:9,health:13,abilities:[
 {kind:'keyword',ids:['守护'],raw:0},
 {kind:'cost',trigger:'入场曲',ids:['shuffleCost'],raw:0},
 {kind:'core',trigger:'谢幕曲',condition:'none',ids:['summon'],raw:10.8}
]};
assert(S.highCostReadiness(reported)<11);
const counts={repaired:0,bronze:0,high:0,death:0},examples=[];
for(let i=0;i<12000;i++){
 const c=S.generate('高费保底'+i);if(c.type!=='follower')continue;
 assert(c.attack+c.health+c.spent<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(c.cost>=7){counts.high++;if(c.abilities.some(a=>a.trigger==='谢幕曲'))counts.death++;}
 if(!c.highCostFloor)continue;
 counts.repaired++;assert(c.highCostFloor.after+.001>=c.highCostFloor.target,c.name+' readiness');
 assert(c.abilities.some(a=>a.ids.includes('highCostFloor')&&a.trigger==='入场曲'));
 if(c.simpleDesign){counts.bronze++;assert(c.abilities.filter(a=>a.kind==='core').length===1,c.name+' simple core');}
 if(examples.length<6)examples.push(c.name);
}
assert(counts.repaired>30&&counts.bronze>10&&counts.death>100);
fs.writeFileSync(__dirname+'/high-cost-floor-validation.json',JSON.stringify({version:S.VERSION,seeds:12000,counts,examples},null,2));
console.log('PASS',counts,examples);

const assert=require('node:assert/strict'),S=require('./engine');
const check=require('./assert-node-effects.cjs');
const buff={ids:['evolutionSacrifice','crystalHandBuff'],raw:9,kind:'evolutionSacrifice',trigger:'进化时',condition:'none',text:'使自己的战场上的所有『天晶魔手』+1/+3。'};
const fixture={type:'follower',cost:4,rarity:3,abilities:[buff],alternateForms:[]};
assert(!S.evolutionOnlyQuality(fixture));assert(!S.designIdentity(fixture));
assert(!S.evolutionOnlyQuality({...fixture,abilities:[{...buff,raw:40}]}),'Empty-board payoff is still unsupported at a larger printed number');
const producer={ids:['crystalHandSummon'],kind:'effect',trigger:'入场曲',condition:'none',raw:3.6,text:'召唤2个『天晶魔手』。'};
assert(S.evolutionOnlyQuality({...fixture,abilities:[producer,buff]}));
const mode={...buff,kind:'mode',modeBranches:[buff,{...producer,raw:5}],raw:40};
assert(!S.evolutionOnlyQuality({...fixture,abilities:[mode]}),'Exclusive branches must not support each other');
const direct={...buff,ids:['aoe'],raw:16,text:'对对手的战场上的所有随从造成4点伤害。'};
assert(S.evolutionOnlyQuality({...fixture,abilities:[direct]}),'Keep substantial evolution-only designs');
const counts={onlyEvolve:0,replay:0,namedBuff:0,supported:0};
for(let i=0;i<8000;i++){
 const options={chaos:i%2===0},c=S.generate(i===0?'设计师您辛苦了#855484':'进化依赖510-'+i,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(S.evolutionOnlyQuality(c),c.name+' weak evolution-only design');
 if(i===0){assert(S.designIdentity(c));assert.deepEqual([c.class,c.cost,c.rarity],[3,4,3]);}
 const effects=c.abilities.filter(a=>a.kind!=='keyword'&&a.kind!=='alternate');
 if(c.type==='follower'&&effects.length&&effects.every(a=>['进化时','超进化时'].includes(a.trigger)))counts.onlyEvolve++;
 if(c.abilities.some(a=>a.ids.includes('replay')))counts.replay++;
 if(c.abilities.some(a=>a.ids.includes('crystalHandBuff'))){
  counts.namedBuff++;
  if(c.abilities.some(a=>!a.modeBranches&&/(?:召唤\d+个|将\d+张)『天晶魔手』/.test(a.text)))counts.supported++;
 }
 if(i<30)assert.deepEqual(c,S.generate(c.name,options));
}
assert(counts.onlyEvolve>0);assert(counts.replay>0);assert(counts.supported>0);
console.log({version:S.VERSION,samples:8000,counts});

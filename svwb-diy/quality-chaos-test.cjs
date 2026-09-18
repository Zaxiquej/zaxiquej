const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const stats={normal:{signature:0,foreign:0,rarities:[0,0,0,0]},chaos:{signature:0,foreign:0,rarities:[0,0,0,0]},blank:0,body45:0,royalSummon:0,royalBuff:0,asymmetric:0,emblems:0,handCondition:0,accelerate:0};
const examples={};
for(let i=0;i<8000;i++){
 const name='质量与混乱'+i,normal=S.generate(name);
 for(const chaos of [false,true]){
  const c=chaos?S.generate(name,{chaos:true}):normal,key=chaos?'chaos':'normal';
  assert.equal(c.class,normal.class);assert.equal(c.type,normal.type);assert.equal(c.cost,normal.cost);
  stats[key].rarities[c.rarity]++;
  assert(!Object.hasOwn(c,'foreignClass'));
  const gates={combo:[1],forestHistory:[1],rally:[2],earth:[3],spells:[3],costChanged:[3],overflow:[4],ppFull:[4],discard:[4],necromancy:[5],selfDamage:[5],lowHealth:[4,5],singleton:[0,7],artifact:[7],artifactKinds:[7],amulet:[6],amuletHistory:[6],wardBoard:[6]};
  for(const a of c.abilities)if(gates[a.condition])assert(gates[a.condition].includes(c.class),`${c.name}: foreign ${a.condition}`);
  if(chaos){
   assert.equal(c.chaosPower.effectMultiplier,1.18);
   if(c.stormPlan){const p=c.stormPlan;assert(p.effectAllowance+1e-8>=Math.max(.65,(c.cost*1.15-S.stormCardValue(p.attack,p.health,[]).value)*3));}
   else assert(c.budget>c.chaosPower.baseBudget);
   if(c.type==='follower'&&c.cost>=2)assert(c.chaosPower.bodyBonus>=1);
  }
  assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name+' budget '+key);
  assert(c.abilities.length<=5);
  if(c.signature)stats[key].signature++;
  if(c.tokens.some(t=>!t.custom&&t.class!==c.class&&t.class!==0&&!(c.class===3&&t.id===90061130&&t.transformationOnly)))stats[key].foreign++;
  if(i<100)assert.deepEqual(c,S.generate(name,{chaos}));
  for(const a of c.abilities)if(a.trigger&&!['入场曲','进化时','超进化时','法术','爆能强化','启动'].includes(a.trigger))assert(!/选择(?:自己|对手)的|【模式】/.test(a.text),c.name+' automatic selection');
  if(c.type==='follower'&&c.cost>=5&&c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('疾驰')))assert(c.attack>=Math.max(2,Math.floor(c.cost*.4)));
  for(const f of c.alternateForms.filter(f=>f.kind==='激奏')){
   stats.accelerate++;assert.equal(f.budget,f.cost*2.4+.4);assert(f.spent<=f.budget+.01);
   assert(f.abilities.every(a=>a.condition==='none'&&a.trigger==='法术'));
   assert(f.abilities.reduce((n,a)=>n+a.ids.length,0)<=2);
  }
  if(chaos)continue;
  if(c.type==='follower'&&c.vanilla){stats.blank++;assert(c.attack+c.health>=[0,3,5,9,10][c.cost]);}
  if(c.cost===4&&c.type==='follower'&&[9,10].includes(c.attack+c.health)){stats.body45++;examples.body45??=name;}
  const text=c.abilities.map(a=>a.text).join('\n');
  if(c.class===2&&/召唤.*『(?:骑士|铁甲骑士)』/.test(text)){stats.royalSummon++;if(/使这些随从\+/.test(text)){stats.royalBuff++;examples.royalBuff??=name;}}
  if([...text.matchAll(/\+(\d+)\/\+(\d+)/g)].some(m=>m[1]!==m[2]))stats.asymmetric++;
  stats.emblems+=c.emblems.length;stats.handCondition+=c.emblems.filter(e=>e.conditionId==='hand').length;
 }
}
assert(stats.chaos.signature>stats.normal.signature*1.5);
assert.equal(stats.chaos.foreign,0);
assert(stats.chaos.rarities[3]>stats.normal.rarities[3]*2);
assert(stats.chaos.rarities[2]+stats.chaos.rarities[3]>8000*.60);
for(const type of Object.keys(S.TYPES))for(let cls=0;cls<8;cls++)for(let rarity=0;rarity<4;rarity++){
 const filters={type,class:cls,rarity};
 for(const variantOf of [undefined,'混乱筛选#123456']){
  const name=S.randomMatchingName(filters,{chaos:true,variantOf,random:()=>.123456});
  const c=S.generate(name,{chaos:true});assert.deepEqual([c.type,c.class,c.rarity],[type,cls,rarity]);
 }
}
assert(stats.blank>0&&stats.body45>50&&stats.royalBuff>5&&stats.asymmetric>100&&stats.accelerate>20);
assert(stats.handCondition/stats.emblems<.12);
fs.writeFileSync(__dirname+'/quality-chaos-validation.json',JSON.stringify({version:S.VERSION,seeds:8000,stats,examples},null,2));console.log('PASS',stats,examples);

const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const count=s=>(s.match(/选择(?:自己|对手)的(?:战场上的)?[1-9][个张]/g)||[]).length;
function targets(a){const branches=a.text.split(/\n（\d+）/);return branches.length>1?count(branches[0])+Math.max(...branches.slice(1).map(count)):count(a.text);}
const phase=t=>['入场曲','法术','爆能强化'].includes(t)?'play':['进化时','超进化时'].includes(t)?'evolve':t;
const coverage={permanentDeath:0,highEvolutionWithKeyword:0,modes:0,automatic:0,automaticRandom:0,wardDeath:0},examples={};
const manual=new Set(['入场曲','法术','爆能强化','进化时','超进化时','启动']);
// Previously these could ask for a target, a hand card, or a mode on an automatic event.
for(const name of ['被动目标23','被动目标650','被动目标660','被动目标664','被动目标725']){
 const c=S.generate(name);
 for(const a of c.abilities)if(a.trigger&&!manual.has(a.trigger))assert(!/选择|【模式】/.test(a.text),name+' '+a.text);
}
for(let i=0;i<30000;i++){
 const c=S.generate('阶段兼容'+i);
 if(c.type==='amulet'&&c.countdown===null&&c.abilities.some(a=>a.trigger==='谢幕曲')){
  assert(c.abilities.some(a=>a.activation?.breaksSelf),c.name+' needs self destruction');coverage.permanentDeath++;examples.permanentDeath??=c.name;
 }
 if(c.type==='follower'&&c.cost>=6){
  assert(!c.abilities.length||c.abilities.some(a=>!['进化时','超进化时'].includes(a.trigger)),c.name+' only evolution');
  if(c.abilities.some(a=>a.kind==='keyword')&&c.abilities.filter(a=>a.kind!=='keyword').every(a=>['进化时','超进化时'].includes(a.trigger))){coverage.highEvolutionWithKeyword++;examples.evolution??=c.name;}
 }
 const phases={};
 for(const a of c.abilities){
  if(a.trigger&&!manual.has(a.trigger)){
   assert.equal(targets(a),0,c.name+' automatic target: '+a.text);
   assert(!/【模式】|选择[1-9]个能力/.test(a.text),c.name+' automatic mode: '+a.text);
   coverage.automatic++;
   if(a.text.includes('随机'))coverage.automaticRandom++;
   if(a.trigger==='自己的拥有【守护】的其他随从被破坏时'){coverage.wardDeath++;examples.wardDeath??=c.name;}
  }
  const key=phase(a.trigger);let n=targets(a);
  if(a.ids.some(id=>['replay','activationReplay'].includes(id)))n+=c.abilities.filter(f=>f.trigger==='入场曲').reduce((s,f)=>s+targets(f),0);
  phases[key]=(phases[key]||0)+n;if(a.kind==='mode'||a.mode)coverage.modes++;
 }
 for(const [key,n]of Object.entries(phases))assert(n<=1,c.name+' '+key+' '+n+' '+JSON.stringify(c.abilities));
 for(const f of c.alternateForms.filter(f=>f.kind==='激奏')){
  const n=f.abilities.reduce((s,a)=>s+targets(a),0);assert(n<=1,c.name+' accelerate targets');
 }
}
assert(coverage.permanentDeath>0&&coverage.highEvolutionWithKeyword>0&&coverage.modes>0);
assert(coverage.automaticRandom>0&&coverage.wardDeath>0);
fs.writeFileSync(__dirname+'/phase-validation.json',JSON.stringify({version:S.VERSION,coverage,examples},null,2));console.log('PASS: 30,000 seeds; self-contained amulet Last Words, one target per resolution path, high-cost evolution support.');console.log({coverage,examples});

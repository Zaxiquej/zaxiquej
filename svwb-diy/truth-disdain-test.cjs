const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs');
const coverage={},payoffs={truth:new Set(),hurt:new Set()},types=new Set(),examples={};
const hit=(id,c)=>{coverage[id]=(coverage[id]||0)+1;examples[id]??=c.name;};
for(let i=0;i<30000;i++){
 const c=S.generate('真理侮蔑'+i),as=[...c.abilities,...c.alternateForms.flatMap(f=>f.abilities||[])];
 for(const a of as){
  for(const id of ['handBuff','handCostUp','allyPing','allBoardDamage','hurtLink','costChangedLink'].filter(id=>a.ids.includes(id))){hit(id,c);assert(id==='handBuff'?[3,4].includes(c.class):['handCostUp','costChangedLink'].includes(id)?c.class===3:c.class===4);types.add(c.type);}
  if(a.condition==='costChanged'){hit('costChanged',c);assert.equal(c.class,3);assert(a.text.includes('费用不为'));a.ids.forEach(id=>payoffs.truth.add(id));}
  if(a.ids.includes('hurtLink')){assert(a.text.includes('受到伤害且没被破坏时，若为自己的回合，则'));assert(!a.ids.some(id=>['allyPing','allBoardDamage'].includes(id)));assert(!/选择|【模式】/.test(a.text));a.ids.filter(id=>id!=='hurtLink').forEach(id=>payoffs.hurt.add(id));}
  if(a.ids.includes('handBuff')&&a.ids.includes('handCostUp')&&a.text.includes('费用+1，使其+')){hit('pairedHandChange',c);if(a.kind!=='mode'&&!a.mode)assert(a.components&&Math.abs(a.components.reduce((s,p)=>s+p.raw,0)-a.raw)<1e-8);else assert(a.raw>=1.9);}
  if(a.ids.some(id=>['handBuff','handCostUp','allyPing'].includes(id))&&!['入场曲','进化时','超进化时','爆能强化','法术','启动'].includes(a.trigger))assert(!/选择|【模式】/.test(a.text));
 }
 for(const e of [...c.emblems,...c.abilities.filter(a=>a.engineSpec).map(a=>({...a,...a.engineSpec}))]){
  if(!['hurt','costChanged'].includes(e.eventId))continue;hit('engine:'+e.eventId,c);assert.equal(c.class,e.eventId==='hurt'?4:3);assert(!/选择|【模式】/.test(e.text));if(e.eventId==='hurt')assert(e.text.includes('且没被破坏时，若为自己的回合，则'));
 }
 if(c.class===3||c.class===4)assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.011,c.name);
}
for(const id of ['handBuff','handCostUp','allyPing','allBoardDamage','hurtLink','costChangedLink','costChanged','pairedHandChange','engine:hurt','engine:costChanged'])assert(coverage[id]>0,id);
assert.equal(types.size,3);assert(payoffs.truth.size>5&&payoffs.hurt.size>4);
const report={version:S.VERSION,total:30000,coverage,types:[...types],payoffs:Object.fromEntries(Object.entries(payoffs).map(([k,v])=>[k,[...v]])),examples};fs.writeFileSync(__dirname+'/truth-disdain-validation.json',JSON.stringify(report,null,2));console.log('PASS: truth/disdain enablers, conditional and surviving-damage rewards, independent hand atoms, legal targeting, class gates, loop protection and budgets.');console.log(report);

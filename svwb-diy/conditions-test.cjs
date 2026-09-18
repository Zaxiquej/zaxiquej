const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const groups={},examples={};let stacked=0,compound=0;
for(let i=0;i<60000;i++){
 const c=S.generate('困难条件'+i);
 for(const a of c.abilities){
  if(!['combo','earth','necromancy'].includes(a.condition)||a.kind==='ongoing')continue;
  const n=a.conditionAmount,key=a.condition+' '+n;
  assert(n>0);assert(a.raw+1e-8>=a.minPayoff);assert(c.spent<=c.budget+.011);
  if(a.condition==='combo'){assert(c.class===1&&c.cost<=5);assert(a.text.includes(`【连击 ${n}】`));assert(['入场曲','法术','进化时','超进化时','攻击时','启动','自己的回合开始时','自己的回合结束时'].includes(a.trigger),'Combo must use an own-turn timing: '+c.name);}
  if(a.condition==='earth'){assert.equal(c.class,3);assert(!a.ids.includes('earth'),'Do not pay an earth condition by refunding it');}
  if(a.condition==='necromancy'){assert.equal(c.class,5);assert(!a.ids.includes('grave'));}
  const evo=a.trigger==='进化时'?3.5+c.cost*.2:a.trigger==='超进化时'?5.5+c.cost*.35:0;
  if(evo){stacked++;assert(a.minPayoff>evo,'Resource investment must add to the evolution reward');}
  if(a.ids.length>1&&!a.text.includes('【模式】'))compound++;
  (groups[key]??=[]).push(a.raw-evo);examples[key]??=c.name;
 }
}
const means=Object.fromEntries(Object.entries(groups).map(([key,values])=>[key,{count:values.length,mean:values.reduce((a,b)=>a+b,0)/values.length}]));
for(const [id,steps]of [['combo',[2,3,4,5]],['earth',[1,2,3]],['necromancy',[2,4,6,8,10]]]){
 for(let i=0;i<steps.length;i++){
  const here=means[id+' '+steps[i]];assert(here?.count>15,'Missing resource tier');
  if(i)assert(here.mean>means[id+' '+steps[i-1]].mean,'Harder requirements must give more effect value');
 }
}
assert(stacked>100&&compound>100);
const report={version:S.VERSION,stacked,compound,means,examples};
fs.writeFileSync(__dirname+'/conditions-validation.json',JSON.stringify(report,null,2));
console.log('PASS: 60,000 seeds; graded condition rewards, additive evolution investment, compound effects and class/resource constraints.');console.log(report);

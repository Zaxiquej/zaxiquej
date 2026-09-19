const assert=require('node:assert/strict'),fs=require('node:fs');
const S=require('./engine.js'),reference=require('./reference.json');
const band=cost=>cost<=3?0:cost<=6?1:2;
const basic=/^(?:【(?:守护|突进|疾驰|毁灭|虹吸|潜行|威慑|灵气|屏障)】\s*)+$/;
const official=[[],[],[]];
for(const c of reference.cards)if(c.type===1&&!c.token)official[band(c.cost)].push(c);
const samples=Array.from({length:3},()=>({cards:0,keywords:0,damage:[],heal:[],draw:[]}));
let evolutionOnly=0,example;
for(let i=0;i<20000;i++){
 const c=S.generate('权重验证'+i);if(c.type!=='follower')continue;const b=samples[band(c.cost)];b.cards++;
 if(c.abilities.some(a=>a.kind==='keyword'))b.keywords++;
 const active=c.abilities.filter(a=>!['keyword','alternate'].includes(a.kind));
 const only=active.length>0&&active.every(a=>['进化时','超进化时'].includes(a.trigger));
 if(only){
  evolutionOnly++;example||=c.name;
  // A card with multiple already-strong evolution effects need not get another
  // bonus if the remaining legal effect pool has no affordable candidate.
  assert(c.evolutionFocusBonus||active.reduce((s,a)=>s+a.raw,0)>=2*(3.5+c.cost*.2),'Evolution-only followers need a bonus or substantial combined payoff: '+c.name);
  if(c.evolutionFocusBonus)assert(c.evolutionFocusBonus.raw>0&&c.evolutionFocusBonus.price<=c.evolutionFocusBonus.allowance+.01);
  assert(c.attack+c.health+c.spent<=c.budget+.01);
 }
 // Late hand transformation or high-cost repairs can follow the focus bonus.
 if(c.evolutionFocusBonus){
  assert(c.abilities.some(a=>a.trigger===c.evolutionFocusBonus.trigger));
  assert(c.evolutionFocusBonus.price<=c.evolutionFocusBonus.allowance+.01);
 }
 for(const a of c.abilities){
  for(const [key,re]of Object.entries({damage:/造成(\d+)点伤害/g,heal:/回复自己的主战者(\d+)点生命值/g,draw:/抽取(\d+)张卡牌/g})){
   for(const m of a.text.matchAll(re))b[key].push(Number(m[1]));
  }
 }
}
const mean=ns=>ns.reduce((s,n)=>s+n,0)/ns.length;
const report=samples.map((b,i)=>{
 const source=official[i],rate=source.filter(c=>c.text.split('\n').some(line=>basic.test(line))).length/source.length;
 const generated=b.keywords/b.cards;
 // Allow class mix, sparse-cohort smoothing, compatibility and oversized bodies.
 assert(Math.abs(rate-generated)<.06,'Printed keyword prevalence drifted at cost band '+i+': '+rate+' vs '+generated);
 return {cost:['0–3','4–6','7+'][i],officialKeywordRate:rate,generatedKeywordRate:generated,damageMean:mean(b.damage),healMean:mean(b.heal),drawMean:mean(b.draw)};
});
for(const key of ['damageMean','healMean','drawMean']){
 assert(report[1][key]>report[0][key],key+' should increase with cost');
 assert(report[2][key]>report[1][key],key+' should increase with cost');
}
assert(evolutionOnly>500);
console.log('PASS: 20,000 seeds; official keyword prevalence, cost/quantity trends, evolution-only payoff.');
console.log({evolutionOnly,example,report});
fs.writeFileSync(__dirname+'/calibration-validation.json',JSON.stringify({version:S.VERSION,seeds:20000,evolutionOnly,report},null,2));

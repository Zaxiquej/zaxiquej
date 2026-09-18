const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const stats={mid:{n:0,body:0},high:{n:0,body:0},focus:{n:0,raw:0},naked:{n:0,raw:0}},examples={};
const baseline={version:'4.64',mid:{n:2786,body:26841},high:{n:1528,body:21451},focus:{n:588,raw:1146.85},naked:{n:308,raw:597.3}};
for(let i=0;i<12000;i++){
 const c=S.generate('进化与身材'+i);if(c.type!=='follower')continue;
 assert(c.attack+c.health+c.spent<=c.budget+.02,c.name+' budget');
 const band=c.cost>=7?'high':c.cost>=4?'mid':null;
 if(band){stats[band].n++;stats[band].body+=c.attack+c.health;}
 if(c.bodyHeadroom){assert(c.cost>=4);assert(c.bodyHeadroom<=(c.cost<=6?2:3));examples[band]??=c.name;}
 if(c.evolutionFocusBonus){
  const b=c.evolutionFocusBonus;
  assert(c.abilities.every(a=>a.kind==='keyword'||a.kind==='alternate'||['进化时','超进化时'].includes(a.trigger)));
  assert(b.price<=b.allowance+1e-8);assert(b.raw>=(b.naked?2.6:1.8)+c.cost*.2-1e-8);
  for(const key of ['focus',...(c.abilities.every(a=>['进化时','超进化时'].includes(a.trigger))?['naked']:[])]){stats[key].n++;stats[key].raw+=b.raw;examples[key]??=c.name;}
 }
 if(c.cost>=5&&c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('疾驰')))assert(S.stormCardValue(c.attack,c.health,c.abilities).value<=c.cost+.01);
 if(i<200)assert.deepEqual(c,S.generate(c.name));
}
for(const key of ['mid','high']){assert.equal(stats[key].n,baseline[key].n);assert(stats[key].body/stats[key].n>baseline[key].body/baseline[key].n+.2);}
for(const key of ['focus','naked']){assert(stats[key].n>baseline[key].n*.8);assert(stats[key].raw/stats[key].n>baseline[key].raw/baseline[key].n*1.5);}
const report={version:S.VERSION,seeds:12000,baseline,stats,examples};fs.writeFileSync(__dirname+'/evolution-body-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

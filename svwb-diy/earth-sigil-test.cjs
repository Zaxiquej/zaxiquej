const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={soil:0,activation:0,extra:0,chaos:0,otherSelfBreak:0},examples={};
for(let i=0;i<12000;i++){
 const c=S.generate('土印启动'+i,{chaos:i%2===0});if(c.type!=='amulet')continue;
 assert(c.spent<=c.budget+.02,c.name+' budget');
 const soil=c.abilities.some(a=>a.ids.includes('earthSigil'));
 if(!soil){if(c.abilities.some(a=>a.activation?.breaksSelf))counts.otherSelfBreak++;continue;}
 counts.soil++;if(c.chaos)counts.chaos++;assert.equal(c.countdown,null);
 assert(c.abilities.some(a=>a.trigger==='启动'),'Every earth sigil must offer soil generation');
 for(const a of c.abilities.filter(a=>a.trigger==='启动')){
  counts.activation++;assert(!a.activation.breaksSelf);assert(!/破坏本(?:卡牌|护符)/.test(a.text));assert(a.activation.repeats>1);
  assert(a.activation.earthAmount>=1);assert(a.text.includes(`土之印+${a.activation.earthAmount}`));
  if(a.ids.some(id=>!['earth','activate'].includes(id))){counts.extra++;examples.extra??=c.name;}
  assert(Math.abs(a.price-Math.max(.4,(a.raw-a.activation.credit)*a.activation.repeats))<1e-8,'Surviving activation must pay recurring value');
 }
 examples.soil??=c.name;assert.deepEqual(c,S.generate(c.name,{chaos:i%2===0}));
}
assert(counts.soil>15&&counts.activation>0&&counts.chaos>0&&counts.otherSelfBreak>100);
assert(counts.extra>0);
const report={version:S.VERSION,samples:12000,counts,examples};fs.writeFileSync(__dirname+'/earth-sigil-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);

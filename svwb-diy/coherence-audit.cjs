const S=require('./engine'),fs=require('node:fs');
const counts={cards:6000,witch:0,named:0,namedConflict:0,namedOtherEngine:0,alternateConflict:0,flexibleModes:0},examples=[];
for(let i=0;i<counts.cards;i++){
 const c=S.generate('体系聚焦503-'+i,{chaos:i%3===0});
 if(c.class!==3)continue;counts.witch++;
 for(const a of c.abilities.filter(a=>a.modeBranches)){
  const branchTags=a.modeBranches.map(b=>S.strategyTags({abilities:[b]}));
  if(branchTags[0].length&&branchTags[1].length&&S.strategyAffinity(branchTags[0],branchTags[1])<1)counts.flexibleModes++;
 }
 const text=[...c.abilities.filter(a=>a.kind!=='alternate'&&a.kind!=='mode'&&!a.mode).map(a=>a.text),...c.emblems.map(e=>e.text)].join('\n');
 const experiment=text.includes('沉溺的实验体'),hands=text.includes('天晶魔手');
 if(experiment||hands){
  counts.named++;
  if(/土之|魔力增幅|费用发生变化|费用不为/.test(text))counts.namedOtherEngine++;
 }
 if(experiment&&hands){counts.namedConflict++;if(examples.length<6)examples.push(c.name);}
 for(const f of c.alternateForms){const t=S.strategyTags({abilities:f.abilities||[]});if(experiment&&t.includes('crystalHands')||hands&&t.includes('experiment'))counts.alternateConflict++;}
}
const report={version:S.VERSION,method:'mandatory-effects-only; optional mode branches counted separately',counts,examples};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(report);

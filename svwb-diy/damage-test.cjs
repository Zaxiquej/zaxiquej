const assert=require('node:assert/strict'),S=require('./engine'),fs=require('node:fs');
const sample=()=>Array.from({length:3},()=>({n:0,one:0,sum:0}));
const all=sample(),types={follower:sample(),spell:sample(),amulet:sample()};
for(let i=0;i<12000;i++){
 const c=S.generate('伤害校准'+i);assert.deepEqual(c,S.generate(c.name));
 for(const a of c.abilities){
  if(!['入场曲','进化时','超进化时','谢幕曲','法术','启动'].includes(a.trigger))continue;
  for(const m of a.text.matchAll(/([^。\n]*?)造成(\d+)点伤害/g)){
   if(m[1].includes('自己的主战者')&&!m[1].includes('对手'))continue;
   const n=+m[2],band=c.cost<=3?0:c.cost<=6?1:2;
   for(const rows of [all,types[c.type]]){const b=rows[band];b.n++;b.sum+=n;if(n===1)b.one++;}
  }
 }
}
const summarize=rows=>rows.map(b=>({...b,mean:b.sum/b.n,oneRate:b.one/b.n}));
const report={version:S.VERSION,all:summarize(all),types:Object.fromEntries(Object.entries(types).map(([k,v])=>[k,summarize(v)]))};
assert(report.all[1].mean>report.all[0].mean);assert(report.all[2].mean>report.all[1].mean);
assert(report.all[1].oneRate<.1);assert(report.all[2].oneRate<.035);
for(const rows of Object.values(report.types)){assert(rows[2].mean>rows[0].mean);assert(rows[2].oneRate<rows[0].oneRate);}
fs.writeFileSync(__dirname+'/damage-validation.json',JSON.stringify(report,null,2));console.log('PASS: 12,000 deterministic seeds; cost-scaled damage across card types and reduced high-cost chip damage.');console.log(report.all);

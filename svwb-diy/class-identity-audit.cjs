const S=require('./engine'),I=require('./class-identity'),fs=require('node:fs');
const groups={};
for(let i=0;i<8000;i++){
 const c=S.generate('职业特色505-'+i,{chaos:i%3===0});if(c.type!=='follower'||c.class===0)continue;
 const key=c.class+':'+(c.rarity>=2?'goldRainbow':'bronzeSilver');
 const g=groups[key]??={cards:0,featured:0,features:{}};g.cards++;
 const families=I.cardFamilies(c);if(families.length)g.featured++;
 for(const f of families)g.features[f]=(g.features[f]||0)+1;
}
const report={version:S.VERSION,samples:8000,method:'Generated class-appropriate effects or mechanics; optional modes count as useful class support, not conflicting mandatory requirements.',groups};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');console.log(report);

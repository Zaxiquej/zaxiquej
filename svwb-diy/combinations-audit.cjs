const fs=require('node:fs'),S=require('./engine'),C=require('./combinations');
const baseline=process.argv.includes('--baseline'),file=__dirname+'/combinations-validation.json';
const counts={},examples={};let paired=0;
for(let i=0;i<3000;i++){
 const card=S.generate('合理组合'+i),nodes=card.abilities;const links=new Set();
 for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++)C.links(nodes[a],nodes[b]).forEach(id=>links.add(id));
 if(links.size)paired++;
 for(const id of links){counts[id]=(counts[id]||0)+1;examples[id]??=card.name;}
}
const prior=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const report={...prior,note:'Only ten newly classified relations, not all useful card synergies. Before used incomplete artifact metadata; do not treat before/after as a controlled overall synergy or win-rate comparison.',[baseline?'before':'after']:{version:S.VERSION,n:3000,paired,counts,examples}};
fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');console.log(report[baseline?'before':'after']);

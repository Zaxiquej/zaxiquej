const assert=require('node:assert/strict'),S=require('./engine');
const ghost=S.TOKENS.find(t=>t.id===90051130);
assert(ghost.text.includes('离场时'));assert(!ghost.text.includes('谢幕曲'));
let examined=0,ghostGrants=0,leaveRewards=0,normalDeaths=0;
const examples={};
function check(a,c){
 const g=a.summonGrants;
 if(g){
  if(g.tokenId===ghost.id){
   ghostGrants++;assert(!g.grants.some(p=>p.id.startsWith('summonDeath')),c.name);
   assert(!a.text.includes('「【谢幕曲】'),c.name);
   for(const p of g.grants.filter(p=>p.id.startsWith('summonLeave'))){
    leaveRewards++;examples[p.id]??=c.name;
    assert(a.text.includes('「离场时，'));assert(p.raw>0);
   }
  }else if(g.grants.some(p=>p.id.startsWith('summonDeath'))){
   normalDeaths++;assert(a.text.includes('「【谢幕曲】'));
  }
 }
 for(const branch of a.modeBranches||[])check(branch,c);
}
for(let i=0;i<50000;i++){
 const name='怨灵离场回归'+i,options={chaos:i%2===1},h=S.header(name,options);
 if(h.class!==5||h.cost<3)continue;
 const c=S.generate(name,options);examined++;
 for(const a of [...c.abilities,...c.alternateForms.flatMap(f=>f.abilities||[])])check(a,c);
 if(examined>=1200&&leaveRewards>=5&&normalDeaths>=5)break;
}
assert(ghostGrants>0&&leaveRewards>=5&&normalDeaths>=5);
console.log('PASS: Ghost grants use leaving, other followers retain Last Words.',{examined,ghostGrants,leaveRewards,normalDeaths,examples});

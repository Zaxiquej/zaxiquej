const assert=require('node:assert/strict'),S=require('./engine');
const counts={ward:0,intimidate:0,ambush:0,wardGrants:0};
function check(c){
 const keys=c.abilities.filter(a=>a.kind==='keyword').flatMap(a=>a.ids);
 assert(!(keys.includes('守护')&&keys.some(k=>['威慑','潜行'].includes(k))),c.name);
 if(keys.includes('守护'))counts.ward++;
 if(keys.includes('威慑'))counts.intimidate++;
 if(keys.includes('潜行'))counts.ambush++;
 for(const a of c.abilities){
  if(!a.summonGrants?.grants.some(g=>g.id==='summonWard'))continue;
  counts.wardGrants++;
  const t=c.tokens.find(t=>t.id===a.summonGrants.tokenId);assert(t);
  assert(!/【(?:威慑|潜行)】/.test(t.text),c.name+' '+t.name);
 }
 for(const f of c.alternateForms||[])if(f.abilities)check({...f,name:c.name});
}
for(const name of ['词条互斥118','词条互斥154'])check(S.generate(name));
for(let i=0;i<5000;i++){
 const name='词条互斥'+i,options={chaos:i%2===1},c=S.generate(name,options);check(c);
 if(i%500===0)assert.deepEqual(c,S.generate(name,options));
}
for(const [key,count]of Object.entries(counts))assert(count>0,key);
console.log('PASS: Ward conflicts excluded from printed keywords, late defensive bodies, summoned tokens and alternate forms.',counts);

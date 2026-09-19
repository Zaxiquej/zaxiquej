const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const added=[90011120,90031130,90031140,90032110,90034130,90054110,90054120,90074120,90074130,90074140,90011310,90031210,90031310];
for(const id of added){const t=[...S.TOKENS,...S.SUPPORT_CARDS].find(t=>t.id===id),ref=R.cards.find(c=>c.id===id);for(const k of ['name','class','cost','attack','health','text'])assert.equal(t[k],ref[k]);}
const counts={},examples={};let state=492;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<10000;i++){
 const cls=[1,3,5,7][i%4],c=S.generate(S.randomMatchingName({class:cls},{random}));
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 for(const a of [...c.abilities.filter(a=>a.kind!=='alternate'),...c.alternateForms.flatMap(f=>f.abilities||[])])for(const t of a.tokens||[]){
  if(!added.includes(t.id))continue;
  assert.equal(t.class,c.class,c.name+' craft');
  assert(c.tokens.some(v=>v.id===t.id),c.name+' token display');
  counts[t.id]=(counts[t.id]||0)+1;examples[t.id]??=c.name;
  if(t.commonSupply){assert(a.ids.includes('commonSupply'));assert(a.text.includes('加入手牌'));assert(!a.text.includes(`召唤1个『${t.name}』`));}
 }
}
for(const id of added)assert(counts[id]>0,'Unreachable token '+id);
assert(S.tokenValue(S.TOKENS.find(t=>t.id===90074120))>S.tokenValue(S.TOKENS[1])*3);
fs.writeFileSync(__dirname+'/common-token-validation.json',JSON.stringify({version:S.VERSION,seeds:10000,counts,examples},null,2));console.log('PASS',counts,examples);

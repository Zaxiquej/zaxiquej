const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),Q=require('./inspector-search'),R=require('./reference.json'),D=require('./token-delivery');
const check=require('./assert-node-effects.cjs');
for(const id of [90031130,90031140,90034110]){
 const t=S.TOKENS.find(t=>t.id===id),official=R.cards.find(t=>t.id===id);
 for(const key of ['cost','attack','health','text','class'])assert.equal(t[key],official[key]);
 assert(D.tokens[id].summonOnly);let offers=0;
 for(let seed=0;seed<1000;seed++){
  const h=S.tokenHandOffer(t,seed);if(!h)continue;offers++;
  assert(h.discount>=1);assert(h.unitPrice>S.tokenValue(t,'hand'));assert(h.text(1).includes('费用-'));
 }
 assert(offers>0&&offers<220);
}
const summonOnly=S.TOKENS.filter(t=>t.cost>=2&&D.tokens[t.id]?.summonOnly);
const both=Q.compile({query:'『式神·小纸人』，『式神·暴鬼』'});
const counts={witch:0,paper:0,demon:0,both:0,mixed:0,royalMixed:0,nightmareMixed:0,tianhou:0},examples={};
for(let i=0;i<16000;i++){
 const c=S.generate('式神排查-'+i);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 const text=c.abilities.map(a=>a.text).join('\n');
 if(c.class===3){counts.witch++;for(const [key,ok] of [['paper',text.includes('式神·小纸人')],['demon',text.includes('式神·暴鬼')],['both',both(c)],['tianhou',text.includes('式神·天后')]])if(ok){counts[key]++;examples[key]??={name:c.name,text};}}
 for(const a of c.abilities)if(a.mixedSummon){
  counts.mixed++;if(c.class===2)counts.royalMixed++;if(c.class===5)counts.nightmareMixed++;
  const m=a.mixedSummon;assert.equal(new Set(m.tokenIds).size,m.count);
  assert.equal(m.raw,m.tokenIds.reduce((sum,id)=>sum+S.tokenValue(S.TOKENS.find(t=>t.id===id)),0));
 }
 for(const a of [...c.abilities,...c.alternateForms,...c.emblems,...c.tokens.filter(t=>t.custom)])for(const t of summonOnly){
  for(const match of (a.text||'').matchAll(new RegExp(`将[0-9X]+张『${t.name}』加入手牌`,'g'))){
   assert(/^，使这些卡牌的费用-[12]。/.test(a.text.slice(match.index+match[0].length)),c.name+' full-price summon-only token: '+a.text);
  }
 }
 if(i<20)assert.deepEqual(c,S.generate(c.name));
}
for(const key of ['paper','demon','both','royalMixed','nightmareMixed','tianhou'])assert(counts[key]>0,'Missing route: '+key);
const result={version:S.VERSION,samples:16000,counts,examples};fs.writeFileSync(__dirname+'/mixed-token-validation.json',JSON.stringify(result,null,2)+'\n');console.log(result);

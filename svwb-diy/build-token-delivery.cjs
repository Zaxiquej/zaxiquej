const fs=require('node:fs'),R=require('./reference.json');
const data={source:R.source,retrieved:R.retrieved,tokens:{}};
for(const t of R.cards.filter(t=>t.token&&t.type===1)){
 const summon=[],hand=[];
 for(const c of R.cards){
  if(c.id===t.id)continue;
  const sentences=c.text.split(/[。\n]/).filter(s=>s.includes('『'+t.name+'』'));
  if(sentences.some(s=>/召唤/.test(s)))summon.push(c.id);
  if(sentences.some(s=>/加入手牌/.test(s)))hand.push(c.id);
 }
 data.tokens[t.id]={name:t.name,summonSources:summon,handSources:hand,summonOnly:summon.length>0&&hand.length===0};
}
fs.writeFileSync(__dirname+'/token-delivery.js',`// Explicit named deliveries observed in the official snapshot; not an exhaustive rules prohibition.\n(function(root){const data=${JSON.stringify(data)};if(typeof module!=='undefined'&&module.exports)module.exports=data;else root.SVWBTokenDelivery=data;})(typeof globalThis!=='undefined'?globalThis:this);\n`);
console.log(Object.values(data.tokens).filter(t=>t.summonOnly).map(t=>t.name));

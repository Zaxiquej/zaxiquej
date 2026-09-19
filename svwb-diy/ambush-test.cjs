const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const official=require('./reference.json').cards.find(c=>c.id===10221120);
assert.deepEqual([official.cost,official.attack,official.health],[5,4,5]);
assert(S.ambushCardValue(4,5,[]).value<=5);
assert(S.ambushCardValue(6,6,[]).value>6);
assert(S.ambushCardValue(5,5,[]).value>5);
const extra=[{kind:'effect',ids:['draw'],trigger:'入场曲',price:2.8}];
assert(S.ambushCardValue(4,5,extra).value>5,'Ninja Master body cannot add free draw');
const price=a=>S.keywordPrice('潜行',a,5);
assert(price(6)-price(5)>price(2)-price(1));
assert(S.keywordPrice('潜行',6,5,{attacks:2})>price(6));
assert(S.ambushCardValue(4,5,[{kind:'static',ids:['doubleAttack'],price:0}]).value>5);
let seen=0,high=0,paid=0,rejected=0;const examples=[];
for(let i=0;i<16000;i++){
 const chaos=i>=10000,c=S.generate('潜行审计'+i,{chaos});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(c.ambushRejected){rejected++;assert(!c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('潜行')));}
 const a=c.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('潜行'));if(!a)continue;
 seen++;assert(c.attack>=1&&c.health>=1);
 assert(!c.bodyBalance,'Ambush counts as an offensive keyword');
 const attacks=c.abilities.some(a=>a.ids.includes('tripleAttack'))?3:c.abilities.some(a=>a.ids.includes('doubleAttack'))?2:1;
 assert(Math.abs(a.price-S.keywordPrice('潜行',c.attack,c.health,{attacks}))<1e-8,c.name+' final attack pricing');
 if(c.cost>=4){
  high++;const t=c.ambushPackageTrade;assert(t);
  assert(S.ambushCardValue(c.attack,c.health,c.abilities).value<=t.limit+1e-8,c.name+' Ambush package');
  assert(c.attack>=Math.max(2,Math.floor(c.cost*.4)),'No costly low-attack Ambush filler');
  if(t.attackLost+t.healthLost>0){paid++;if(examples.length<6)examples.push({name:c.name,cost:c.cost,before:t.before,after:[c.attack,c.health]});}
  if(!chaos&&c.cost===5)assert(!(c.attack>=6&&c.health>=6));
 }
 if(i<100)assert.deepEqual(c,S.generate(c.name,{chaos}));
}
assert(seen>40&&high>15&&paid>10&&rejected>0);
const report={version:S.VERSION,samples:16000,seen,high,paid,rejected,examples};
fs.writeFileSync(__dirname+'/ambush-validation.json',JSON.stringify(report,null,2));console.log('PASS',report);

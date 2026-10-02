const assert=require('node:assert/strict'),S=require('./engine');
const counts={cards:0,tokens:0,forms:0,faithTrades:0};
function inspect(c){
 const seen=new Set();
 function visit(t){
  if(!t||seen.has(t))return;seen.add(t);
  if(t.cost!=null)assert(Number.isInteger(t.cost)&&t.cost>=0,`${c.name}: ${t.name} cost=${t.cost}`);
  for(const key of ['attack','health'])if(t[key]!=null)assert(Number.isInteger(t[key])&&t[key]>=0,`${c.name}: ${t.name} ${key}=${t[key]}`);
  if(t.type==='follower')assert(t.health>=1,`${c.name}: living follower needs health`);
  for(const token of t.tokens||[]){counts.tokens++;visit(token);}
  for(const form of t.alternateForms||[]){counts.forms++;visit(form);}
 }
 visit(c);counts.cards++;
 if(c.faithBodyTrade){
  const trade=c.faithBodyTrade;counts.faithTrades++;
  assert(Number.isInteger(trade.spent)&&Number.isInteger(trade.after));
  assert.equal(trade.before-trade.after,trade.spent);
 }
}
// These seeds previously returned fractional health from faith budget trades.
for(const name of ['信仰消费4223','信仰消费1958','整数检查12703']){
 const c=S.generate(name);inspect(c);assert(c.faithBodyTrade,`${name}: retain the regression path`);
 assert.deepEqual(c,S.generate(name));
}
for(let i=0;i<4000;i++)inspect(S.generate('整数身材回归'+i,{chaos:i%2===1}));
assert(counts.tokens>100&&counts.forms>20&&counts.faithTrades>=3);
console.log('PASS: integer body trades, printed stats, transformed/token definitions and alternate costs.',counts);

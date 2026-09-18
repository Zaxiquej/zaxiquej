const assert=require('node:assert/strict'),S=require('./engine');
const count=text=>{
 const f=s=>[...s.matchAll(/从自己的牌组中随机将([1-9])张|抽取([1-9])张护符/g)].reduce((n,m)=>n+Number(m[1]||m[2]),0);
 const b=text.split(/\n（\d+）/);return b.length>1?f(b[0])+Math.max(...b.slice(1).map(f)):f(text);
};
let cheap=0,highMultiple=0;const quantities=[0,0,0,0];
for(let i=0;i<20000;i++){
 const c=S.generate('检索校准'+i);
 for(const a of c.abilities){
  const n=count(a.text);if(!n)continue;quantities[Math.min(3,n)]++;
  if(c.cost<=3&&a.condition==='none'&&['入场曲','法术'].includes(a.trigger)){cheap++;assert(n<=1,c.name+' '+a.text);}
  if(c.cost<=3&&a.condition==='none'&&['进化时','超进化时'].includes(a.trigger))assert(n<=2,c.name+' '+a.text);
  if(c.cost>=7&&n>=2)highMultiple++;
  if(n>=2&&a.ids.length===1&&a.kind!=='mode')assert(a.raw>=6.6,c.name+' discounted multi-search raw value');
 }
 for(const f of c.alternateForms.filter(f=>f.kind==='激奏'&&f.cost<=3)){
  for(const a of f.abilities)if(a.condition==='none'&&a.trigger==='法术')assert(count(a.text)<=1,c.name+' cheap accelerate search');
 }
}
assert(cheap>100&&highMultiple>5&&quantities[3]>0);
assert(quantities[1]>quantities[2]+quantities[3],'One-card search should predominate');
console.log('PASS: 20,000 seeds; low-cost search caps, expensive multi-search, nonlinear valuation and cheap spell forms.');console.log({cheap,highMultiple,quantities});

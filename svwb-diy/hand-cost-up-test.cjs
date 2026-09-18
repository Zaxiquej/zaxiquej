const assert=require('node:assert/strict'),S=require('./engine');
let count=0,valuations=0,automatic=0;const partners=new Set(),examples=[];
for(let i=0;i<20000;i++){
 const c=S.generate('手牌加费代价'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities.filter(a=>a.ids.includes('handCostUp'))){
  count++;assert.equal(c.class,3);assert(a.ids.some(id=>id!=='handCostUp'));
  a.ids.filter(id=>id!=='handCostUp').forEach(id=>partners.add(id));
  if(examples.length<4)examples.push({name:c.name,chaos:!!c.chaos,text:a.text});
  if(a.drawback){
   valuations++;const d=a.drawback;assert(d.credit>0&&d.credit<=1);
   assert(d.payoffRaw>=d.credit+1.3-1e-8);
   if(a.ids.length===2)assert(Math.abs(a.raw-(d.payoffRaw-d.credit))<1e-8);
   if(d.linked)assert(d.credit<.5);
   assert(a.components.some(p=>p.id==='handCostUp'&&p.raw<0));
  }
  if(!['入场曲','法术','进化时','超进化时','爆能强化','启动'].includes(a.trigger)){
   automatic++;assert(!/选择(?:自己|对手)的/.test(a.text));
  }
 }
}
assert(count>10&&valuations>5&&automatic>0);assert(partners.size>4);
console.log(JSON.stringify({count,valuations,automatic,partners:[...partners],examples},null,2));

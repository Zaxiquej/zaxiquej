const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs');
const ids=['opponentHandCopy','opponentDeckCopy','opponentCopyTransform'],coverage={},types=new Set(),timings=new Set(),amounts=new Set(),examples={};let mixed=0,paidBodies=0;
for(let i=0;i<30000;i++){
 const c=S.generate('对手复制'+i);const abilities=[...c.abilities,...c.alternateForms.flatMap(f=>f.abilities||[])];
 for(const a of abilities.filter(a=>a.ids.some(id=>ids.includes(id)))){
  assert([0,1].includes(c.class));assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.011);
  types.add(c.type);timings.add(a.trigger);
  for(const id of a.ids.filter(id=>ids.includes(id))){coverage[id]=(coverage[id]||0)+1;examples[id]??=c.name;}
  for(const text of a.text.split('。').filter(text=>text.includes('复制卡牌')))assert(!/舍弃对手|使对手.*消失|选择对手/.test(text));
  if(!['入场曲','进化时','超进化时','爆能强化','法术','启动'].includes(a.trigger))assert(!/选择|【模式】/.test(a.text));
  for(const m of a.text.matchAll(/将对手的(?:手牌|牌组)中的随机([1-3])张卡牌的复制卡牌各1张以非公开形式加入自己的手牌/g)){
   const n=Number(m[1]);amounts.add(n);assert(a.raw>=n*2.4+.5*n*(n-1)-1e-8);
   if(c.type!=='amulet'&&c.cost<=3&&a.condition==='none'&&!c.alternateForms.length&&a.trigger!=='爆能强化')assert.equal(n,1);
  }
  if(c.abilities.length>1||a.ids.some(id=>!ids.includes(id)))mixed++;
 }
 if(c.type==='follower'&&c.cost===2&&c.abilities.some(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'&&a.ids.some(id=>ids.slice(0,2).includes(id)))){paidBodies++;assert(c.attack+c.health<=3);}
}
for(const id of ids)assert(coverage[id]>10,id);assert.equal(types.size,3);assert(amounts.has(1)&&amounts.has(2));assert(mixed>30&&paidBodies>0);assert(timings.has('谢幕曲')&&timings.has('进化时'));
const report={version:S.VERSION,total:30000,coverage,types:[...types],timings:[...timings],amounts:[...amounts],mixed,paidBodies,examples};fs.writeFileSync(__dirname+'/opponent-copy-validation.json',JSON.stringify(report,null,2));console.log('PASS: hidden copies from opposing hand/deck, hand transformation, modular timings, classes, value, quantity and body limits.');console.log(report);

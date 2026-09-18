const S=require('./engine'),assert=require('node:assert/strict');
let lastWords=0,over=0,rush=0,alreadyPaid=0,conditionalFull=0,evolutionFull=0;const examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('谢幕抽牌估值'+i);if(c.type!=='follower'||c.cost!==2)continue;
 const resource=a=>a.ids.some(id=>['draw','keywordSearch','typeSearch','wardSearch','amuletSearch','tutor'].includes(id));
 const immediate=c.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'&&resource(a));
 if(immediate.length){
  assert(c.attack+c.health<=3,c.name);
  if(c.bodyTrade){alreadyPaid++;assert(!c.resourceBodyTrade,'Existing sufficient body payment must not be charged twice');}
  assert((c.resourceBodyTrade?.lost||0)+(c.boardBodyTrade?.lost||0)<=2,'Partial trades must share the body payment');
  if(c.abilities.some(a=>a.trigger==='谢幕曲'&&a.condition==='none'&&a.ids.includes('draw'))){
   lastWords++;if(c.attack+c.health>3)over++;
   if(c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('突进'))){rush++;examples.rush??=c.name;}
  }
 }else{
  if(c.abilities.some(a=>resource(a)&&a.condition!=='none')&&c.attack+c.health===4)conditionalFull++;
  if(c.abilities.some(a=>resource(a)&&['进化时','超进化时'].includes(a.trigger))&&c.attack+c.health===4)evolutionFull++;
 }
 if(c.resourceBodyTrade){assert(c.resourceBodyTrade.lost>=1&&c.resourceBodyTrade.lost<=2);assert.equal(c.bodyAllowance,c.attack+c.health);}
 assert(c.spent+c.attack+c.health<=c.budget+.011);
}
assert(lastWords>100&&rush>0&&alreadyPaid>0&&conditionalFull>0&&evolutionFull>0);
console.log('PASS: 2 PP resource bodies, Rush does not pay separately, no double charge, conditional/evolution exceptions and budgets.');console.log({lastWords,over,rush,alreadyPaid,conditionalFull,evolutionFull,examples});

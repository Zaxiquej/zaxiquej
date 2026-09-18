const S=require('./engine'),assert=require('node:assert/strict');
const histogram={};let twos=0,endEvents=0,trades=0;
for(let i=0;i<20000;i++){
 const c=S.generate('身材与回合结束'+i);
 if(c.type==='follower'&&c.cost===2){
  twos++;const key=c.attack+'/'+c.health;histogram[key]=(histogram[key]||0)+1;
  if(c.bodyTrade){trades++;assert(c.attack+c.health<=2);assert(c.bodyTrade.payoffRaw>=c.bodyTrade.lost+2);}
  assert(c.attack+c.health+c.spent<=c.budget+.011);
 }
 for(const a of [...c.abilities,...c.emblems,...c.tokens,...c.alternateForms.flatMap(f=>f.abilities||[])]){
  const texts=a.trigger==='自己的回合结束时'||a.eventId==='end'?[a.text]:a.text.split('\n').filter(t=>t.startsWith('自己的回合结束时'));
  for(const text of texts){endEvents++;assert(!/选择|【模式】/.test(text),c.name+' '+text);}
 }
}
assert(twos>1000&&endEvents>100&&trades>30);
assert(histogram['2/2']/twos<.45);assert(histogram['1/3']/twos>.15&&histogram['3/1']/twos>.15);assert(histogram['1/1']/twos>.04);
console.log('PASS: diverse 2 PP bodies with paid strong effects; all sampled end-turn effects are automatic.');console.log({twos,histogram,trades,endEvents});

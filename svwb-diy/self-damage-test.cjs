const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const stats={nightmare:0,cards:0,abilities:0},payoffs=new Set(),types=new Set(),examples=[];
for(let i=0;i<16000;i++){
 const c=S.generate('自伤代价'+i);if(c.class===5)stats.nightmare++;
 const list=c.abilities.filter(a=>a.condition==='selfDamage');assert(list.length<=1,c.name);
 if(!list.length)continue;stats.cards++;types.add(c.type);
 assert.equal(c.class,5);assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02);
 for(const a of list){
  stats.abilities++;assert(['入场曲','法术','进化时','超进化时'].includes(a.trigger));
  assert(a.resourceCost>=1&&a.resourceCost<=(c.cost>=4?3:2));
  assert(a.text.includes(`对自己的主战者造成${a.resourceCost}点伤害。然后，`));
  assert(!a.ids.some(id=>['heal','bloodDraw'].includes(id)));
  assert(a.raw>=a.minPayoff&&a.price<a.raw);
  if(c.cost<4)assert(!a.ids.some(id=>['selfEvolve','selfSuperEvolve'].includes(id)));
  a.ids.forEach(id=>payoffs.add(id));
 }
 if(examples.length<5)examples.push({name:c.name,cost:c.cost,text:list.map(a=>a.text)});
}
assert(stats.cards>40&&stats.cards/stats.nightmare>.04);assert(payoffs.size>=8&&types.size>=2);
fs.writeFileSync(__dirname+'/self-damage-validation.json',JSON.stringify({version:S.VERSION,stats,payoffs:[...payoffs],types:[...types],examples},null,2));
console.log('PASS',stats,'payoff types',payoffs.size,'card types',[...types],examples.slice(0,2));

const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={invocation:0,invocationReturn:0,invocationStay:0,invocationPayoff:0,evolutionHistory:0,combat:0,restoreEP:0,restoreSEP:0},examples={},payoffs=new Set(),histories=new Set();
const craftHistory={fairies:1,rally:2,spells:3,earthRites:3,discardedCards:4,graveyard:5,amuletDeaths:6,artifactEntries:7};
const specimen={attack:8,health:8,abilities:[{trigger:'入场曲',raw:12,price:12,ids:['fan']},{trigger:'进化时',raw:10,price:4,ids:['evo']},{trigger:'谢幕曲',raw:3,price:2,ids:['death']},{trigger:'本卡牌被【瞬念召唤】时',raw:2,price:2,ids:['arrival']}]};
assert.equal(S.invocationValue(specimen,'return').delivered,4.2);
assert.equal(S.invocationValue(specimen,'stay').delivered,17.8);
assert.equal(S.invocationValue({...specimen,attack:20,health:20},'return').delivered,4.2);
assert(S.invocationValue({...specimen,attack:20,health:20},'stay').delivered>17.8);
for(let i=0;i<20000;i++){
 const c=S.generate('历史机制'+i);
 assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities){
  if(a.kind==='invocation'){
   counts.invocation++;examples.invocation??=c.name;
   const returning=a.invocationMode==='return',modeKey=returning?'invocationReturn':'invocationStay';counts[modeKey]++;examples[modeKey]??=c.name;
   assert(c.type==='follower'&&c.cost>=(returning?3:6)&&c.rarity>=2);
   assert(a.price>=(returning?1.6:4)&&a.text.startsWith('在牌组中发动。')&&a.text.includes('【瞬念召唤】本卡牌'));
   assert(!/选择|【模式】/.test(a.text));
   assert(a.valuation.threshold>=3);histories.add(a.valuation.history);
   assert.equal(a.valuation.delivered,S.invocationValue(c,a.invocationMode).delivered);
   assert.equal(a.valuation.body,returning?0:(c.attack+c.health)*.8);
   assert.equal(a.valuation.cardAccess,returning?2.2:0);
   assert(a.valuation.difficulty>=a.valuation.delivered);
   if(craftHistory[a.valuation.history]!=null)assert.equal(c.class,craftHistory[a.valuation.history]);
   const bounce=c.abilities.filter(x=>x.ids.includes('invocationReturn'));
   assert.equal(bounce.length,returning?1:0);
   if(returning){assert(bounce[0].bodyText.endsWith('本卡牌返回手牌。'));assert.equal(bounce[0].trigger,'本卡牌被【瞬念召唤】时');}
  }
  if(a.trigger==='本卡牌被【瞬念召唤】时'){
   counts.invocationPayoff++;examples.invocationPayoff??=c.name;
   assert(c.abilities.some(x=>x.kind==='invocation'));
   assert(!/选择|【模式】/.test(a.text));
  }
  if(a.condition==='evolutionHistory'){
   counts.evolutionHistory++;examples.evolutionHistory??=c.name;
   assert(c.rarity>=1&&/进化次数为[357]次或以上/.test(a.text));a.ids.forEach(id=>payoffs.add(id));
  }
  if(a.trigger==='交战时'){
   counts.combat++;examples.combat??=c.name;
   assert(c.type==='follower'&&a.condition!=='combo'&&!/选择|【模式】/.test(a.text));
  }
  for(const id of ['restoreEP','restoreSEP'])if(a.ids.includes(id)){
   counts[id]++;examples[id]??=c.name;
   assert(['入场曲','法术','爆能强化'].includes(a.trigger));
   if(id==='restoreSEP')assert(c.rarity>=2);
  }
 }
 if(c.abilities.some(a=>a.kind==='invocation'))assert.deepEqual(c,S.generate(c.name));
}
for(const [key,count]of Object.entries(counts))assert(count>0,key+' absent');
assert(histories.size>=8&&payoffs.size>=8);
fs.writeFileSync(__dirname+'/history-validation.json',JSON.stringify({version:S.VERSION,seeds:20000,counts,examples,evolutionPayoffs:[...payoffs],histories:[...histories]},null,2));
console.log('PASS',counts,examples,'evolution payoff variety',payoffs.size);

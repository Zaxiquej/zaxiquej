const assert=require('node:assert/strict'),S=require('./engine'),R=require('./reference.json');
const counts={},examples={},payoffs={secretArt:new Set(),liberatedArt:new Set()},hostile=new Set();
const hit=(id,c)=>{counts[id]=(counts[id]||0)+1;examples[id]??={name:c.name,chaos:!!c.chaos};};
for(const t of S.SUPPORT_CARDS){const o=R.cards.find(c=>c.id===t.id);for(const k of ['name','cost','attack','health','text','class'])assert.equal(t[k],o[k]);assert.equal(t.type,o.type===4?'spell':'amulet');}
for(let i=0;i<30000;i++){
 const c=S.generate('扩展机制'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');assert(c.abilities.length<=5,c.name+' slots');
 assert(!c.abilities.some(a=>/\$(?:TOKEN|TREASURE|TRIBE)/.test(a.text)));
 for(const a of c.abilities){
  for(const id of a.ids)if(['attackLock','statDebuff','massDebuff','treasureSupply','coinSupply','flagSummon','flagAdvance','chargeGauge','deckDiscount','enemyEmblem','discardSelfSummon','treasureLink','spellLink'].includes(id))hit(id,c);
  if(a.ids.some(id=>['treasureSupply','coinSupply','flagSummon','flagAdvance','treasureLink','spellLink'].includes(id)))assert.equal(c.class,2);
  if(['secretArt','liberatedArt'].includes(a.condition)){hit(a.condition,c);payoffs[a.condition].add(a.ids.join(','));assert.equal(a.conditionAmount,a.condition==='secretArt'?10:15);assert(['入场曲','法术'].includes(a.trigger));assert(!/进化次数/.test(a.bodyText));}
  if(a.ids.includes('attackLock'))assert(a.text.includes('对手的回合结束前'));
  if(!['入场曲','法术','进化时','超进化时','爆能强化','启动'].includes(a.trigger))assert(!/选择(?:自己|对手)的/.test(a.text));
  if(a.ids.includes('discardSelfSummon')){assert.equal(c.class,4);assert.equal(c.type,'follower');assert(a.valuation);assert(Math.abs(a.price-a.valuation.body-a.valuation.retained-1)<1e-7);assert(a.text.includes(`『${c.name}』`));}
 }
 for(const t of c.tokens.filter(t=>t.type&&t.type!=='follower'))assert([1,2,3,7].includes(t.class));
 assert(!c.replacementDeck);assert(!c.abilities.some(a=>a.ids.includes('deckRewrite')));assert(!c.tokens.some(t=>String(t.id).startsWith('deck-reward-')));
 for(const e of c.emblems.filter(e=>e.owner==='opponent')){assert([1,4,5,7].includes(c.class));assert(e.duration===2||e.duration===3);assert(c.abilities.some(a=>a.ids.includes('enemyEmblem')&&a.text.includes('使对手获得')));assert(!e.text.includes('对对手'));hostile.add(e.eventId+e.effects[0].id);}
 if(c.fusion&&c.class===2){assert.equal(c.fusion.material,'财宝·卡牌');hit('treasureFusion',c);}
}
for(const id of ['attackLock','statDebuff','massDebuff','treasureSupply','coinSupply','flagSummon','flagAdvance','chargeGauge','deckDiscount','enemyEmblem','discardSelfSummon','treasureLink','spellLink','secretArt','liberatedArt','treasureFusion'])assert(counts[id]>0,id+' unreachable');
assert(payoffs.secretArt.size>4&&payoffs.liberatedArt.size>4);assert(hostile.size>2);
console.log(JSON.stringify({counts,examples,hostileVariants:hostile.size},null,2));

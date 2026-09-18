const assert=require('node:assert/strict'),S=require('./engine');
const ids=new Set(['draw','handRefill','keywordSearch','typeSearch','wardSearch','amuletSearch','tutor','bloodDraw','opponentHandCopy','opponentDeckCopy']);
let cheap=0,crests=0,trades=0,draw=0;
for(let i=0;i<12000;i++){
 const c=S.generate('低费过牌'+i);if(c.cost>3)continue;cheap++;
 const base=c.abilities.filter(a=>a.condition==='none'&&['入场曲','谢幕曲','法术'].includes(a.trigger));
 const sources=base.filter(a=>a.ids.some(id=>ids.has(id))||a.emblemIds?.some(id=>c.emblems.find(e=>e.id===id)?.effects.some(e=>['draw','tutor','supply'].includes(e.id))));
 assert(sources.length<=1,c.name+' duplicate basic card advantage');
 if(base.some(a=>a.emblemIds))crests++;
 if(c.bodyTrade){trades++;assert.equal(c.abilities.find(a=>a.kind==='bodyPayoff').ids.filter(id=>id!=='bodyPayoff').length,1);}
 // Countdown amortizes the payload over its effective cost; test the new
 // base-cost price on immediate and ordinary follower Last Words only.
 for(const a of base)if(a.ids.length===1&&a.ids[0]==='draw'&&!a.delayFactor){
  draw++;const n=Number(a.text.match(/抽取(\d+)张/)[1]);assert(a.raw>=n*2.8+.5*n*(n-1),c.name+' underpriced draw');
 }
 assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02);
}
const c=S.generate('莉莉猪');assert.equal(c.cost,2);assert.equal(c.attack,1);assert.equal(c.health,1);
assert(c.emblems.some(e=>e.text.includes('【谢幕曲】抽取1张卡牌')));
assert(!c.abilities.some(a=>a.trigger==='入场曲'&&a.text.includes('抽取')));
assert(cheap>1000&&crests>0&&trades>0&&draw>0);
console.log('PASS: low-cost resource pricing, one base advantage source, one effect per body trade, 莉莉猪 regression.',{cheap,crests,trades,draw});

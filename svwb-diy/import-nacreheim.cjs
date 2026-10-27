// Promote a complete, validated official snapshot and preserve a reviewable audit.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const file=n=>path.join(__dirname,n),old=require('./reference.json'),next=require('./reference-latest.json');
const cards=next.cards.filter(c=>c.set===10010&&!c.token),ids=new Set(next.cards.map(c=>c.id));
assert.equal(cards.length,76);assert.equal(ids.size,next.listedCount);
assert(cards.every(c=>c.name&&c.text&&Number.isInteger(c.cost)));
for(const id of [90001210,90061140])assert(next.cards.some(c=>c.id===id&&c.token));
const rules={evidence:/证据|神域的物证/,activation:/启动/,oneCostBoard:/原始费用为1/,swap:/攻击力与生命值交换/,banishBoard:/在战场上消失时/,rabbit:/地害之兔/,fusion:/融合/,discard:/舍弃/,ramp:/能量点最大值\+/,spellboost:/魔力增幅/,earth:/土之/,copy:/复制|本随从同名/,replay:/发动与【入场曲】相同的能力/,evolve:/使其进化|本随从进化/,variable:/X为|X\/Y为/};
const histogram=(rows,key)=>Object.fromEntries([...new Set(rows.map(c=>c[key]))].sort((a,b)=>a-b).map(n=>[n,rows.filter(c=>c[key]===n).length]));
const changedExisting=next.cards.filter(c=>{const p=old.cards.find(p=>p.id===c.id);return p&&['text','cost','attack','health'].some(k=>p[k]!==c[k]);}).map(c=>c.id);
const added=next.cards.filter(c=>!old.cards.some(p=>p.id===c.id)).map(c=>c.id);
const audit={retrieved:next.retrieved,source:next.source,set:10010,total:next.cards.length,newSetCards:76,addedIds:added,changedExisting,
  distribution:{classes:histogram(cards,'class'),types:histogram(cards,'type'),rarities:histogram(cards,'rarity'),costs:histogram(cards,'cost')},
  mechanics:Object.fromEntries(Object.entries(rules).map(([id,re])=>[id,cards.filter(c=>re.test(c.text)).map(c=>c.id)])),
  cards:cards.map(c=>({...c,mechanics:Object.entries(rules).filter(([,re])=>re.test(c.text)).map(([id])=>id),url:`https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=${c.id}`})),
  specialEffects:next.specialEffects.filter(e=>e.sourceCardIds.some(id=>cards.some(c=>c.id===id))),
  valuationNotes:[
    {ids:[11062110,11062310,11063110],change:'地害之兔入手3、召唤6.4；自动进化3/3、手牌损失和谢幕伤害一起估值。原先按7.2召唤、4.2入手过重。'},
    {ids:[11031110,11032110,11033110,11034110],change:'启动护符是巫师独立事件；减费沿用实际落地费用与疾驰联动估值，不按印刷费用发放全额模型。'},
    {ids:[11072110,11073110,11072310],change:'融合护符监听和融合自身立即收益分开；手牌内零PP生效，按材料、次数、即时场面计价。'},
    {ids:[11012110,11013110,11022310,11032310],change:'一费卡场面和本回合启动记录属于可共享条件，不为每条收益重复补贴。'},
    {ids:[11043110],change:'舍弃证据未必成功也能跳费；不误当成必须成功支付的成本，不能无条件抵扣跳费价值。'}
  ],
  boundaries:['未照抄整套金虹效果；通用原子、事件、条件参与组合。','整副牌组改写/清洗依用户要求不接入。','官方收录完整不等于每个特殊句式均已生成：敌方消失后复制、减半生命上限、抽到随从直接拉出等专属复杂句式仍需独立建模。']};
fs.writeFileSync(file('nacreheim-official-audit.json'),JSON.stringify(audit,null,2)+'\n');
fs.copyFileSync(file('reference-latest.json'),file('reference.json'));
console.log(JSON.stringify({total:audit.total,newSet:cards.length,added:added.length,changedExisting,distribution:audit.distribution}));

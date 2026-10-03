(function(root){
'use strict';
function apply(D,I){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 const shield=D.byId.shield;shield.retired=true;D.spells=D.spells.filter(c=>c.id!=='shield');D.retiredSpells.push(shield);
 set('royal13',{effect:'guardSupply',related:[{id:'guard',count:1,scaleCount:true,when:'备战结束加入手牌'}]},m=>`备战结束：获得 ${m} 张武装强化（强化一个友方并赋予守护）。`);
 set('royal2',{},m=>`守护。受到攻击后若存活，使相邻友方皇家永久 +${3*m} 生命。`);
 set('royal7',{},m=>`屏障。开战：其他皇家护卫获得 +${8*m}/+${8*m}；仅相邻友方皇家叠加 ${m} 层屏障。`);
 set('forest7',{},m=>`守护。开战：其他友方妖精族获得「友方妖精族数量 × 4 + 妖精军团」× ${m} 的攻击与生命（仅本场）。`);
 D.byId.banner.text='倒数 2：所有友方永久 +3/+3。共鸣。';
 D.heroes.find(h=>h.id==='athena').armor=6;
 const rows=[
  ['neutral6',1,0,4,'bellLast',['taunt','cannotAttack'],m=>`守护。无法攻击（仍会反击）。谢幕曲：随机友方 +${2*m}/+${2*m}（仅本场）。`],
  ['neutral7',2,3,3,'healCry',[],m=>`入场曲：为英雄恢复 ${4*m} 生命。`],
  ['neutral8',4,4,5,'amuletGift',[],m=>`入场曲：获得 ${m} 张随机护符（来自本局牌池，不高于酒馆星级）。`],
  ['neutral9',4,3,6,'ambushSupport',['stealth'],m=>`潜行。每当相邻友方攻击，使该随从 +${4*m}/+${2*m}（仅本场）。`],
  ['neutral10',6,1,4,'',['destruction'],m=>'毁灭：攻击对主目标造成未被屏障阻挡的伤害时，摧毁目标。不作用于反击或技能伤害。'],
  ['neutral11',3,4,10,'',['taunt','cannotAttack'],m=>'守护。无法攻击，但受攻击时仍以自身攻击力反击。'],
  ['neutral12',3,3,4,'smallSpellGift',[],m=>`入场曲：获得 ${m} 张随机法术（来自本局牌池，最高 2 星）。`],
  ['neutral13',4,4,6,'clockCry',[],m=>`入场曲：所有友方护符倒数减少 ${m}，归零时立即结算。`]
 ];
 for(const [id,tier,attack,health,effect,keywords,rule]of rows){const c={...I.cards[id],id,type:'minion',tribe:'neutral',tier,cost:3,attack,health,effect,keywords,text:rule(1),goldenText:rule(2)};D.cards.push(c);D.byId[id]=c;if(['healCry','amuletGift','smallSpellGift','clockCry'].includes(effect))D.fanfareIds.push(id);}
 D.byId.neutral8.related=[{pool:'amulet',when:'入场曲随机获得'}];D.byId.neutral12.related=[{pool:'spell',maxTier:2,when:'入场曲随机获得'}];
 D.keywordRules={stealth:'潜行：首次攻击前不被选为攻击目标；敌方只剩潜行随从时仍可攻击。潜行中的守护不生效，随机、群体伤害和顺劈仍可命中。',destruction:'毁灭：攻击主目标造成未被屏障阻挡的正数伤害时，直接摧毁目标；反击、顺劈和技能不触发。摧毁会正常触发谢幕曲、复生与复仇。',cannotAttack:'无法攻击：不会主动攻击，即使获得攻击力或连击也不会；受攻击时照常反击。'};
 D.archetypes.royal.routes[0]=['层叠屏障','鲁米那斯骑士与自身补盾随从承接前期；白银圣骑士复仇补盾，六星乙姬只给相邻皇家叠盾。莉夏按层数养成，艾蜜莉亚将破盾转为永久强化。',['royal0','royal15','royal17','royal6','royal7','royal5']];
 D.archetypes.royal.support='勇战的旗手提供武装强化与守护；守护骑士在受攻击后养成相邻皇家的生命。通用屏障法术已移除，外部补盾集中在白银圣骑士与乙姬。';
 D.rulesVersion='13.0';return D;
}
root.TavernUtility={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);

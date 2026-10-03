(function(root){
'use strict';
function apply(D,I){
 const rows=[
 ['forest20','forest',3,3,4,'modalCry',m=>`入场曲，抉择：获得 ${m} 张妖精；或使所有友方妖精族永久 +${2*m}/+${2*m}。`],
 ['royal19','royal',4,5,5,'modalCry',m=>`入场曲，抉择：获得 ${2*m} 张武装强化；或使所有友方皇家永久 +${3*m}/+${3*m}。`],
 ['dragon20','dragon',4,4,6,'activeForge',m=>`启动（0 金币，每回合一次）：选择弃掉一张手牌，使本局酒馆永久 +${3*m}/+${3*m}。`],
 ['rune19','rune',4,4,5,'activeResearch',m=>`启动（1 金币，每回合一次）：法术研习永久 +${2*m}。`],
 ['dragon21','dragon',5,7,7,'discardRally',m=>`每当你弃掉一张手牌，使所有友方龙族永久 +${2*m}/+${3*m}。`],
 ['artifact19','artifact',2,3,4,'discardScrap',m=>`从手牌被弃掉时：残骸永久 +${3*m}。出售、死亡或手牌溢出不触发。`]
 ];
 for(const [id,tribe,tier,attack,health,effect,rule]of rows){const d={...I.cards[id],id,type:'minion',tribe,tier,cost:3,attack,health,effect,keywords:[],text:rule(1),goldenText:rule(2)};D.cards.push(d);D.byId[id]=d;}
 D.byId.forest20.modes=[{id:'fairy',name:'补充妖精',kind:'gift',card:'fairy',count:1},{id:'rally',name:'森林祝福',kind:'tribeBuff',tribe:'forest',attack:2,health:2}];
 D.byId.royal19.modes=[{id:'supplies',name:'补充武装',kind:'gift',card:'guard',count:2},{id:'rally',name:'战线强化',kind:'tribeBuff',tribe:'royal',attack:3,health:3}];
 D.byId.dragon20.activation={cost:0,discard:true};D.byId.rune19.activation={cost:1};
 D.byId.forest20.related=[{id:'fairy',count:1,scaleCount:true,when:'选择补充妖精时加入手牌'}];D.byId.royal19.related=[{id:'guard',count:2,scaleCount:true,when:'选择补充武装时加入手牌'}];
 const spells=[
 {id:'dragonResolve',tribe:'dragon',tier:3,cost:2,effect:'modalSpell',text:'抉择：使本局酒馆永久 +3/+3（受法术研习增强）；或为英雄恢复 6 生命。',modes:[{id:'market',name:'积蓄龙力',kind:'tavern',attack:3,health:3,spellAmp:true},{id:'heal',name:'恢复斗志',kind:'heal',heal:6}]},
 {id:'newDestiny',tribe:'neutral',tier:3,cost:2,effect:'discardExchange',text:'选择弃掉一张其他手牌，获得两张随机法术（本局牌池，最高 2 星）。没有其他手牌时不能使用。',related:[{pool:'spell',maxTier:2,when:'指定弃掉一张手牌后随机获得两张'}]}
 ];
 for(const row of spells){const d={...I.cards[row.id],...row,type:'spell',attack:0,health:0,keywords:[],target:false};D.spells.push(d);D.byId[d.id]=d;}
 const a={...I.cards.dragonRite,id:'dragonRite',tribe:'dragon',type:'amulet',tier:4,cost:3,count:2,effect:'discardRite',attack:0,health:0,keywords:[],text:'在场时：每当你弃掉一张手牌，使本局酒馆永久 +1/+1（不受共鸣增强）。倒数 2：获得一张龙之斗气。',related:[{id:'dragonResolve',count:1,when:'倒数归零加入手牌'}]};D.amulets.push(a);D.byId[a.id]=a;
 D.fanfareIds.push('forest20','royal19');D.abilityIds.fanfare=[...D.fanfareIds];
 D.decisionIds=[...rows.map(r=>r[0]),...spells.map(r=>r.id),'dragonRite'];
 D.archetypes.dragon.support+=' 龙人工匠启动时指定弃牌，帝国龙骑士把弃牌转为全队身材；龙女巫的仪式在场时将弃牌转为酒馆成长。';
 D.archetypes.forest.support+=' 宝菈的入场曲可抉择补充妖精或强化队伍。';D.archetypes.royal.support+=' 篡夺的使徒可抉择补充武装强化或直接强化皇家队伍。';D.archetypes.rune.support+=' 精通咒法的女巫可以每回合花费金币启动，主动提高法术研习。';D.archetypes.artifact.support+=' 废弃物被弃掉时增加残骸，可配合龙人工匠或崭新的命运。';
 D.rulesVersion='17.0';return D;
}
root.TavernDecisions={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
